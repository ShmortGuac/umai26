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

Registration happens in the Google Form. Organisers approve players there, then import them into the portal,
where players sign in with a one-time email code and submit their prelim video link.

```
Google Form ──► responses Sheet ──(tick "Approved", download CSV)──► /portal/admin → Players → Import
                                                                         │
player enters registration email ──► 6-digit code by email ──► /portal ──► submits video link
                                                                         │
                                       /portal/admin → Submissions ◄─────┘  review, verify, export seeding
```

The portal shows "opening soon" until these steps are done.

1. Create a project at [supabase.com](https://supabase.com) (Singapore region is closest).
2. **SQL Editor**: run `supabase/schema.sql`. It's safe to re-run later.
3. **Add organisers** in the SQL Editor (lowercase emails):
   ```sql
   insert into public.admins (email) values ('you@example.com'), ('friend@example.com');
   ```
4. **Send codes instead of links.** Authentication → Emails → Templates → **Magic Link**, replace the body with:
   ```html
   <h2>Your U-mai '26 sign-in code</h2>
   <p>Enter this code on the Player Portal:</p>
   <p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
   <p>It expires in 1 hour. If you didn't request it, ignore this email.</p>
   ```
   Codes work even when players open the email on a different device from the one they're signing in on.
5. **Set up email sending (required for real use).** Supabase's built-in email only sends a few messages per hour.
   Create a free account at [resend.com](https://resend.com) (or any SMTP provider), then fill in
   Project Settings → Authentication → **SMTP Settings**. Raise the email rate limit under Authentication → Rate Limits if needed.
6. **Authentication → URL Configuration**: set the Site URL to your production domain.
7. Copy **Project URL** and the **anon public key** (Project Settings → API) into `.env` locally, or the Vercel environment variables:
   ```
   NUXT_PUBLIC_SUPABASE_URL=...
   NUXT_PUBLIC_SUPABASE_KEY=...
   ```

### Running it

- **Import players:** add an *Approved* checkbox column to the form's responses Sheet and tick players once payment and
  student ID are checked. Download the Sheet as CSV (File → Download → .csv) and upload it under **Admin → Players**.
  Pick the Approved column in "Only import rows approved in…" so unticked rows are skipped. Re-upload any time; new
  emails are added, existing players are updated, nobody is removed.
- **Players sign in** at `/portal` with the email they used in the form. Emails not on the list are told they're not approved yet.
- **Review** under **Admin → Submissions**: watch the video, enter the verified total, approve or reject (with a note the
  player sees), and **Export CSV** for seeding. If a player resubmits, the entry goes back to pending and needs re-checking.

The prelim window is enforced in two places. Keep them in sync:
`prelims` in `app/app.config.ts` (UI) and `prelims_open()` in `supabase/schema.sql` (database).

## Deploy (Vercel)

Import the GitHub repo in Vercel. It detects Nuxt automatically. Add the two `NUXT_PUBLIC_SUPABASE_*` env vars and deploy.
