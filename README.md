# U-mai '26 — University maimai Tournament

Official site for U-mai '26: rules, schedule, registration and donations.
Finals: **12 December 2026 · Sunway Wangsa Walk**.

Built with Nuxt 4, Vue 3 and Tailwind CSS 4.

## Develop

```bash
npm install
npm run dev            # http://localhost:3000
```

## Editing content

| What | Where |
| --- | --- |
| Registration / Discord / donation / social links, dates, prelim songs, donation QR | `app/app.config.ts` |
| Rulebook text and finals-day schedule | `app/utils/rules.ts` |
| Downloadable rulebook PDF | `public/U-mai26-Rulebook.pdf` |
| Logos | `public/img/` |

## Deploy (Vercel)

Import the GitHub repo in Vercel. It detects Nuxt automatically, so just deploy.
