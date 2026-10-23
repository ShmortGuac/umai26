-- U-mai '26 player portal schema.
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- Safe to re-run: tables are kept, functions/policies/triggers are recreated.
--
-- How access works:
--   • `players` is the approved roster, imported by organisers from the Google Form CSV.
--   • Anyone whose login email is in `players` can see their own row and submit a prelim.
--   • Anyone whose login email is in `admins` can see and manage everything.
--   • Everyone else can sign in but sees nothing and can do nothing.

-- ─── Cleanup from the earlier open-signup version ────────────────
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
do $$
begin
  -- The old submissions table was keyed on user_id; only drop it if it is that version.
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'prelim_submissions' and column_name = 'user_id') then
    drop table public.prelim_submissions cascade;
  end if;
end $$;
drop table if exists public.profiles cascade;
drop function if exists public.guard_profile();

-- ─── Prelim window ───────────────────────────────────────────────
-- Keep in sync with `prelims` in app/app.config.ts.
create or replace function public.prelims_open()
returns boolean language sql stable as $$
  select now() between '2026-11-15 00:00:00+08' and '2026-11-29 23:59:59+08';
$$;

-- ─── Tables ──────────────────────────────────────────────────────
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);

create table if not exists public.players (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique check (email = lower(email)),
  name        text,
  discord     text,
  ign         text,      -- maimai DX in-game name
  university  text,
  imported_at timestamptz not null default now()
);

create table if not exists public.prelim_submissions (
  id              uuid primary key default gen_random_uuid(),
  player_id       uuid not null unique references public.players (id) on delete cascade,
  video_url       text not null check (video_url ~* '^https?://'),
  song1           numeric(7,4) check (song1 between 0 and 101),
  song2           numeric(7,4) check (song2 between 0 and 101),
  song3           numeric(7,4) check (song3 between 0 and 101),
  notes           text,
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  verified_total  numeric(8,4),   -- filled in by admins after checking the video
  admin_note      text,
  submitted_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── Helpers ─────────────────────────────────────────────────────
create or replace function public.current_email()
returns text language sql stable as $$
  select lower(auth.jwt() ->> 'email');
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = public.current_email());
$$;

create or replace function public.current_player_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.players where email = public.current_email();
$$;

-- Lets the login page say "not on the approved list" before sending a code.
create or replace function public.can_sign_in(p_email text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.players where email = lower(trim(p_email)))
      or exists (select 1 from public.admins where email = lower(trim(p_email)));
$$;
grant execute on function public.can_sign_in(text) to anon, authenticated;

-- Players can't touch review fields. Any player change is a new video to check,
-- so it goes back to pending and the previous verification and note are cleared.
create or replace function public.guard_submission()
returns trigger language plpgsql as $$
begin
  -- Only guard API requests; the SQL editor / service role can do anything.
  if current_user in ('anon', 'authenticated') and not public.is_admin() then
    if tg_op = 'UPDATE' then
      new.player_id := old.player_id;
    end if;
    new.status := 'pending';
    new.verified_total := null;
    new.admin_note := null;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists guard_submission on public.prelim_submissions;
create trigger guard_submission
  before insert or update on public.prelim_submissions
  for each row execute function public.guard_submission();

-- ─── Row level security ──────────────────────────────────────────
alter table public.admins enable row level security;
alter table public.players enable row level security;
alter table public.prelim_submissions enable row level security;

drop policy if exists "admins: admin read" on public.admins;
create policy "admins: admin read" on public.admins
  for select using (public.is_admin());

drop policy if exists "players: read own or admin" on public.players;
create policy "players: read own or admin" on public.players
  for select using (email = public.current_email() or public.is_admin());

drop policy if exists "players: admin insert" on public.players;
create policy "players: admin insert" on public.players
  for insert with check (public.is_admin());

drop policy if exists "players: admin update" on public.players;
create policy "players: admin update" on public.players
  for update using (public.is_admin());

drop policy if exists "players: admin delete" on public.players;
create policy "players: admin delete" on public.players
  for delete using (public.is_admin());

drop policy if exists "subs: read own or admin" on public.prelim_submissions;
create policy "subs: read own or admin" on public.prelim_submissions
  for select using (player_id = public.current_player_id() or public.is_admin());

drop policy if exists "subs: insert own while open" on public.prelim_submissions;
create policy "subs: insert own while open" on public.prelim_submissions
  for insert with check (player_id = public.current_player_id() and public.prelims_open());

drop policy if exists "subs: update own while open, or admin" on public.prelim_submissions;
create policy "subs: update own while open, or admin" on public.prelim_submissions
  for update using ((player_id = public.current_player_id() and public.prelims_open()) or public.is_admin());

drop policy if exists "subs: admin delete" on public.prelim_submissions;
create policy "subs: admin delete" on public.prelim_submissions
  for delete using (public.is_admin());

-- ─── Add organisers ──────────────────────────────────────────────
-- Run once per organiser (lowercase email). They can then sign in with an email code.
--   insert into public.admins (email) values ('you@example.com');
