-- U-mai '26 player portal schema.
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Safe to re-run: it drops and recreates policies/triggers but keeps tables.

-- ─── Prelim window ───────────────────────────────────────────────
-- Keep in sync with `prelims` in app/app.config.ts.
create or replace function public.prelims_open()
returns boolean language sql stable as $$
  select now() between '2026-11-15 00:00:00+08' and '2026-11-29 23:59:59+08';
$$;

-- ─── Tables ──────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  ign          text,      -- maimai DX in-game name
  university   text,
  discord      text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.prelim_submissions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references public.profiles (id) on delete cascade,
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
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Create a profile row whenever someone signs up (Discord or email).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, discord)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    case when new.raw_app_meta_data ->> 'provider' = 'discord'
         then coalesce(new.raw_user_meta_data -> 'custom_claims' ->> 'global_name', new.raw_user_meta_data ->> 'full_name')
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Players can't promote themselves to admin.
create or replace function public.guard_profile()
returns trigger language plpgsql as $$
begin
  -- Only guard API requests; the SQL editor / service role can do anything.
  if current_user in ('anon', 'authenticated') and not public.is_admin() then
    new.is_admin := old.is_admin;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists guard_profile on public.profiles;
create trigger guard_profile
  before update on public.profiles
  for each row execute function public.guard_profile();

-- Players can't touch review fields; resubmitting puts the entry back to pending.
create or replace function public.guard_submission()
returns trigger language plpgsql as $$
begin
  if current_user in ('anon', 'authenticated') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending';
      new.verified_total := null;
      new.admin_note := null;
    else
      new.status := 'pending';
      new.verified_total := old.verified_total;
      new.admin_note := old.admin_note;
      new.user_id := old.user_id;
    end if;
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
alter table public.profiles enable row level security;
alter table public.prelim_submissions enable row level security;

drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: update own or admin" on public.profiles;
create policy "profiles: update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

drop policy if exists "subs: read own or admin" on public.prelim_submissions;
create policy "subs: read own or admin" on public.prelim_submissions
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "subs: insert own while open" on public.prelim_submissions;
create policy "subs: insert own while open" on public.prelim_submissions
  for insert with check (user_id = auth.uid() and public.prelims_open());

drop policy if exists "subs: update own while open, or admin" on public.prelim_submissions;
create policy "subs: update own while open, or admin" on public.prelim_submissions
  for update using ((user_id = auth.uid() and public.prelims_open()) or public.is_admin());

drop policy if exists "subs: admin delete" on public.prelim_submissions;
create policy "subs: admin delete" on public.prelim_submissions
  for delete using (public.is_admin());

-- ─── Make yourself an admin ──────────────────────────────────────
-- After signing in once, run:
--   update public.profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');
