// CSV helpers for importing the Google Form responses sheet.

/** RFC 4180 parser: handles quoted fields, escaped quotes, and commas/newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const s = text.replace(/^﻿/, '')

  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++ }
        else quoted = false
      }
      else field += c
    }
    else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++
      row.push(field); field = ''
      rows.push(row); row = []
    }
    else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  // Drop blank lines.
  return rows.filter(r => r.some(cell => cell.trim() !== ''))
}

export type PlayerField = 'email' | 'name' | 'discord' | 'ign' | 'university'

export const playerFields: { key: PlayerField, label: string, required?: boolean }[] = [
  { key: 'email', label: 'Email', required: true },
  { key: 'name', label: 'Full name' },
  { key: 'discord', label: 'Discord username' },
  { key: 'ign', label: 'maimai in-game name' },
  { key: 'university', label: 'University' },
]

// Order matters: in-game name is checked before name so "In-game name" isn't taken as the full name.
const guesses: [PlayerField | 'approved', RegExp][] = [
  ['email', /e-?mail/i],
  ['discord', /discord/i],
  ['ign', /in.?game|\bign\b|maimai.*name|player name/i],
  ['university', /universit|institution|college|\buni\b/i],
  ['name', /name|nama/i],
  ['approved', /approv|verif|paid|accept/i],
]

/** Best-guess mapping from sheet headers to player fields. Values are column indexes, or -1. */
export function guessColumns(headers: string[]) {
  const map: Record<PlayerField | 'approved', number> = { email: -1, name: -1, discord: -1, ign: -1, university: -1, approved: -1 }
  const taken = new Set<number>()
  for (const [field, re] of guesses) {
    const i = headers.findIndex((h, idx) => !taken.has(idx) && re.test(h))
    if (i !== -1) { map[field] = i; taken.add(i) }
  }
  return map
}

/** Google Sheets checkboxes export as TRUE/FALSE; also accept the usual yes-ish words. */
export function isApprovedValue(v: string | undefined) {
  return /^(true|yes|y|approved|paid|verified|accepted|ok|done|1|x|✓|✔|✅)$/i.test((v ?? '').trim())
}

export function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}
