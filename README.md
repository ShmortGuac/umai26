# U-mai '26 — University maimai Tournament

Official site for U-mai '26: rules, schedule, registration, donations and a player portal for preliminary submissions.
Finals: **12 December 2026 · Sunway Wangsa Walk**.

Built with Nuxt 4, Vue 3, Tailwind CSS 4 and Supabase.

## Develop

```bash
npm install
cp .env.example .env   # optional: only needed for the player portal
npm run dev            # http://localhost:3000
```

## Editing content

| What | Where |
| --- | --- |
| Registration / Discord / donation / social links, dates, prelim songs, donation QR | `app/app.config.ts` |
| Rulebook text and finals-day schedule | `app/utils/rules.ts` |
| Downloadable rulebook PDF | `public/U-mai26-Rulebook.pdf` |
| Logos | `public/img/` |

## Player portal (Supabase)

The portal shows "opening soon" until these steps are done.

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/schema.sql`.
3. **Authentication → Providers**:
   - Email is on by default (magic links).
   - Enable **Discord**: create an app at <https://discord.com/developers/applications>, add the redirect URL Supabase shows you under OAuth2, and paste the client ID and secret into Supabase.
4. **Authentication → URL Configuration**: set the Site URL to your production domain and add `http://localhost:3000/**` and `https://<your-domain>/**` to the Redirect URLs.
5. Copy **Project URL** and the **anon public key** into `.env` (locally) or the Vercel environment variables:
   ```
   NUXT_PUBLIC_SUPABASE_URL=...
   NUXT_PUBLIC_SUPABASE_KEY=...
   ```
6. Sign in once on `/portal`, then make yourself an admin in the SQL editor:
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'you@example.com');
   ```
   Admins get an **Open admin dashboard** button (`/portal/admin`) for reviewing videos, setting verified totals, and exporting a seeding CSV.

The prelim window is enforced in two places. Keep them in sync:
`prelims` in `app/app.config.ts` (UI) and `prelims_open()` in `supabase/schema.sql` (database).

## Deploy (Vercel)

Import the GitHub repo in Vercel. It detects Nuxt automatically. Add the two `NUXT_PUBLIC_SUPABASE_*` env vars and deploy.
