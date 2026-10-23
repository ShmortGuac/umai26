<script setup lang="ts">
import type { Player, Submission } from '~/composables/useSupabase'
import type { PlayerField } from '~/utils/csv'

const props = defineProps<{ players: Player[], submissions: Submission[] }>()
const emit = defineEmits<{ changed: [] }>()

const supabase = useSupabase()!

// ─── CSV import ───────────────────────────────────────────────
const fileName = ref('')
const headers = ref<string[]>([])
const rows = ref<string[][]>([])
const mapping = reactive<Record<PlayerField | 'approved', number>>({ email: -1, name: -1, discord: -1, ign: -1, university: -1, approved: -1 })
const importing = ref(false)
const importResult = ref('')
const importError = ref('')

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  importResult.value = ''
  importError.value = ''
  if (!file) return
  const table = parseCsv(await file.text())
  if (table.length < 2) {
    importError.value = 'That file has no data rows.'
    return
  }
  fileName.value = file.name
  headers.value = table[0]!.map(h => h.trim())
  rows.value = table.slice(1)
  Object.assign(mapping, guessColumns(headers.value))
}

const existingEmails = computed(() => new Set(props.players.map(p => p.email)))

const preview = computed(() => {
  if (!rows.value.length || mapping.email === -1) return null
  const cell = (r: string[], i: number) => (i === -1 ? '' : (r[i] ?? '').trim())
  const seen = new Set<string>()
  const ok: Omit<Player, 'id' | 'imported_at'>[] = []
  let notApproved = 0
  let badEmail = 0
  let duplicate = 0

  for (const r of rows.value) {
    if (mapping.approved !== -1 && !isApprovedValue(r[mapping.approved])) { notApproved++; continue }
    const email = cell(r, mapping.email).toLowerCase()
    if (!isEmail(email)) { badEmail++; continue }
    // Later rows win, so someone who re-submitted the form gets their newest details.
    if (seen.has(email)) {
      duplicate++
      ok.splice(ok.findIndex(p => p.email === email), 1)
    }
    seen.add(email)
    ok.push({
      email,
      name: cell(r, mapping.name) || null,
      discord: cell(r, mapping.discord) || null,
      ign: cell(r, mapping.ign) || null,
      university: cell(r, mapping.university) || null,
    })
  }
  const added = ok.filter(p => !existingEmails.value.has(p.email)).length
  return { ok, added, updated: ok.length - added, notApproved, badEmail, duplicate }
})

async function runImport() {
  if (!preview.value?.ok.length) return
  importing.value = true
  importError.value = ''
  const { error } = await supabase.from('players').upsert(preview.value.ok, { onConflict: 'email' })
  importing.value = false
  if (error) {
    importError.value = error.message
    return
  }
  importResult.value = `Imported ${preview.value.ok.length} players: ${preview.value.added} new, ${preview.value.updated} updated.`
  headers.value = []
  rows.value = []
  fileName.value = ''
  emit('changed')
}

// ─── Add one player by hand ───────────────────────────────────
const manual = reactive({ email: '', name: '', discord: '', ign: '', university: '' })
const adding = ref(false)
const addError = ref('')

async function addPlayer() {
  adding.value = true
  addError.value = ''
  const { error } = await supabase.from('players').upsert({
    email: manual.email.trim().toLowerCase(),
    name: manual.name.trim() || null,
    discord: manual.discord.trim() || null,
    ign: manual.ign.trim() || null,
    university: manual.university.trim() || null,
  }, { onConflict: 'email' })
  adding.value = false
  if (error) addError.value = error.message
  else {
    Object.assign(manual, { email: '', name: '', discord: '', ign: '', university: '' })
    emit('changed')
  }
}

// ─── Roster ───────────────────────────────────────────────────
const search = ref('')
const statusByPlayer = computed(() => new Map(props.submissions.map(s => [s.player_id, s.status])))

const roster = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.players.filter(p =>
    !q || [p.email, p.name, p.discord, p.ign, p.university].some(v => v?.toLowerCase().includes(q)))
})

async function removePlayer(p: Player) {
  const hasSub = statusByPlayer.value.has(p.id)
  const msg = `Remove ${p.ign || p.email} from the approved list?${hasSub ? '\n\nTheir prelim submission will be deleted too.' : ''}`
  if (!confirm(msg)) return
  const { error } = await supabase.from('players').delete().eq('id', p.id)
  if (error) alert(error.message)
  else emit('changed')
}
</script>

<template>
  <div class="space-y-8">
    <!-- Import -->
    <section class="card p-6 sm:p-8">
      <h2 class="font-display text-xl font-bold text-white">Import approved players</h2>
      <ol class="mt-3 list-decimal space-y-1 pl-5 text-sm text-fg-muted">
        <li>Open the Google Form's responses Sheet.</li>
        <li>Tip: add an <strong class="text-white">Approved</strong> checkbox column and tick players once payment and student ID are checked.</li>
        <li><strong class="text-white">File → Download → Comma-separated values (.csv)</strong>, then upload it here.</li>
      </ol>
      <p class="mt-2 text-xs text-fg-muted">
        Re-uploading is safe: new emails are added and existing players get their details updated. Nobody is removed.
        The file is read in your browser; only the mapped columns are saved.
      </p>

      <label class="btn-ghost mt-5 cursor-pointer">
        <input type="file" accept=".csv,text/csv" class="sr-only" @change="onFile">
        {{ fileName ? 'Choose a different file' : 'Choose CSV file' }}
      </label>
      <span v-if="fileName" class="ml-3 text-sm text-fg-muted">{{ fileName }} · {{ rows.length }} rows</span>

      <div v-if="headers.length" class="mt-6 space-y-5">
        <div>
          <p class="label">Match the columns</p>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label v-for="f in playerFields" :key="f.key" class="text-xs text-fg-muted">
              {{ f.label }}<span v-if="f.required" class="text-rose-light"> *</span>
              <select v-model.number="mapping[f.key]" class="input mt-1 py-2">
                <option :value="-1">{{ f.required ? 'Choose a column…' : '(not in sheet)' }}</option>
                <option v-for="(h, i) in headers" :key="i" :value="i">{{ h || `Column ${i + 1}` }}</option>
              </select>
            </label>
            <label class="text-xs text-fg-muted">
              Only import rows approved in…
              <select v-model.number="mapping.approved" class="input mt-1 py-2">
                <option :value="-1">(import every row)</option>
                <option v-for="(h, i) in headers" :key="i" :value="i">{{ h || `Column ${i + 1}` }}</option>
              </select>
            </label>
          </div>
          <p v-if="mapping.approved !== -1" class="mt-2 text-xs text-fg-muted">
            Rows count as approved when that column is TRUE (a ticked checkbox), Yes, Approved, Paid, ✓ and similar.
          </p>
          <p v-else class="mt-2 text-xs text-gold">
            No approval column chosen: every row in the file will get portal access.
          </p>
        </div>

        <div v-if="preview" class="rounded-xl border border-ink-600 bg-ink-900/50 p-4 text-sm">
          <p class="font-semibold text-white">
            {{ preview.ok.length }} players will be imported
            <span class="font-normal text-fg-muted">({{ preview.added }} new, {{ preview.updated }} already on the list)</span>
          </p>
          <ul v-if="preview.notApproved || preview.badEmail || preview.duplicate" class="mt-1 text-fg-muted">
            <li v-if="preview.notApproved">{{ preview.notApproved }} skipped: not approved</li>
            <li v-if="preview.badEmail" class="text-gold">{{ preview.badEmail }} skipped: missing or invalid email</li>
            <li v-if="preview.duplicate">{{ preview.duplicate }} duplicate emails: newest response kept</li>
          </ul>
          <div v-if="preview.ok.length" class="mt-3 overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-fg-muted">
                <tr><th class="py-1 pr-3">Email</th><th class="py-1 pr-3">Name</th><th class="py-1 pr-3">IGN</th><th class="py-1 pr-3">University</th><th class="py-1">Discord</th></tr>
              </thead>
              <tbody>
                <tr v-for="p in preview.ok.slice(0, 5)" :key="p.email" class="border-t border-ink-600/60">
                  <td class="py-1 pr-3">{{ p.email }}</td><td class="py-1 pr-3">{{ p.name }}</td><td class="py-1 pr-3">{{ p.ign }}</td><td class="py-1 pr-3">{{ p.university }}</td><td class="py-1">{{ p.discord }}</td>
                </tr>
              </tbody>
            </table>
            <p v-if="preview.ok.length > 5" class="mt-1 text-xs text-fg-muted">…and {{ preview.ok.length - 5 }} more</p>
          </div>
        </div>

        <button class="btn-primary" :disabled="importing || !preview?.ok.length" @click="runImport">
          {{ importing ? 'Importing…' : `Import ${preview?.ok.length ?? 0} players` }}
        </button>
      </div>

      <p v-if="importResult" class="mt-4 text-sm text-emerald-300" role="status">{{ importResult }}</p>
      <p v-if="importError" class="mt-4 text-sm text-rose-light" role="alert">{{ importError }}</p>
    </section>

    <!-- Manual add -->
    <details class="card group p-6 sm:p-8">
      <summary class="flex cursor-pointer list-none items-center justify-between font-display text-xl font-bold text-white">
        Add a player by hand
        <span class="text-2xl leading-none text-orchid-light transition group-open:rotate-45" aria-hidden="true">+</span>
      </summary>
      <form class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" @submit.prevent="addPlayer">
        <label class="text-xs text-fg-muted">Email <span class="text-rose-light">*</span><input v-model="manual.email" type="email" required class="input mt-1 py-2"></label>
        <label class="text-xs text-fg-muted">Full name<input v-model="manual.name" class="input mt-1 py-2"></label>
        <label class="text-xs text-fg-muted">maimai in-game name<input v-model="manual.ign" class="input mt-1 py-2"></label>
        <label class="text-xs text-fg-muted">University<input v-model="manual.university" class="input mt-1 py-2"></label>
        <label class="text-xs text-fg-muted">Discord username<input v-model="manual.discord" class="input mt-1 py-2"></label>
        <div class="flex items-end">
          <button type="submit" class="btn-ghost w-full py-2" :disabled="adding">{{ adding ? 'Adding…' : 'Add player' }}</button>
        </div>
      </form>
      <p class="mt-2 text-xs text-fg-muted">Using an email that's already on the list updates that player's details.</p>
      <p v-if="addError" class="mt-2 text-sm text-rose-light" role="alert">{{ addError }}</p>
    </details>

    <!-- Roster -->
    <section>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-display text-xl font-bold text-white">Approved players ({{ players.length }})</h2>
        <input v-model="search" type="search" class="input max-w-xs py-2" placeholder="Search name, email, IGN…">
      </div>
      <div class="card mt-4 overflow-x-auto">
        <table class="w-full min-w-[44rem] text-left text-sm">
          <thead class="border-b border-ink-600 text-xs text-fg-muted">
            <tr>
              <th class="px-4 py-3 font-medium">IGN</th>
              <th class="px-4 py-3 font-medium">Name</th>
              <th class="px-4 py-3 font-medium">Email</th>
              <th class="px-4 py-3 font-medium">University</th>
              <th class="px-4 py-3 font-medium">Discord</th>
              <th class="px-4 py-3 font-medium">Prelim</th>
              <th class="px-4 py-3"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!roster.length"><td colspan="7" class="px-4 py-6 text-center text-fg-muted">{{ players.length ? 'No matches.' : 'No players yet. Import the form responses above.' }}</td></tr>
            <tr v-for="p in roster" :key="p.id" class="border-t border-ink-600/50">
              <td class="px-4 py-2.5 font-medium text-white">{{ p.ign || '—' }}</td>
              <td class="px-4 py-2.5">{{ p.name || '—' }}</td>
              <td class="px-4 py-2.5 text-fg-muted">{{ p.email }}</td>
              <td class="px-4 py-2.5">{{ p.university || '—' }}</td>
              <td class="px-4 py-2.5">{{ p.discord || '—' }}</td>
              <td class="px-4 py-2.5">
                <StatusBadge v-if="statusByPlayer.get(p.id)" :status="statusByPlayer.get(p.id)!" />
                <span v-else class="text-xs text-fg-muted">Not submitted</span>
              </td>
              <td class="px-4 py-2.5 text-right">
                <button class="text-xs text-fg-muted hover:text-rose-light" @click="removePlayer(p)">Remove</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
