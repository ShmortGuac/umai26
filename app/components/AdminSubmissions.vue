<script setup lang="ts">
import type { Player, Submission } from '~/composables/useSupabase'

const props = defineProps<{ players: Player[], submissions: Submission[] }>()

const supabase = useSupabase()!
const filter = ref<'all' | Submission['status']>('all')
const savingId = ref<string | null>(null)
const savedId = ref<string | null>(null)
const error = ref('')

const playerById = computed(() => new Map(props.players.map(p => [p.id, p])))

const selfTotal = (s: Submission) => (s.song1 ?? 0) + (s.song2 ?? 0) + (s.song3 ?? 0)
// Seed on the verified total when there is one, otherwise the self-reported total.
const seedScore = (s: Submission) => s.verified_total ?? selfTotal(s)

const visible = computed(() =>
  props.submissions
    .filter(s => filter.value === 'all' || s.status === filter.value)
    .sort((a, b) => seedScore(b) - seedScore(a)))

const counts = computed(() => ({
  pending: props.submissions.filter(s => s.status === 'pending').length,
  approved: props.submissions.filter(s => s.status === 'approved').length,
  rejected: props.submissions.filter(s => s.status === 'rejected').length,
}))

async function save(s: Submission) {
  savingId.value = s.id
  savedId.value = null
  error.value = ''
  const verified = s.verified_total as unknown
  const { error: err } = await supabase
    .from('prelim_submissions')
    .update({
      status: s.status,
      verified_total: verified === null || verified === '' ? null : Number(verified),
      admin_note: s.admin_note?.trim() || null,
    })
    .eq('id', s.id)
  savingId.value = null
  if (err) error.value = err.message
  else savedId.value = s.id
}

function exportCsv() {
  const header = ['seed', 'ign', 'name', 'email', 'university', 'discord', 'song1', 'song2', 'song3', 'self_total', 'verified_total', 'status', 'video_url', 'submitted_at']
  const lines = visible.value.map((s, i) => {
    const p = playerById.value.get(s.player_id)
    return [
      i + 1, p?.ign, p?.name, p?.email, p?.university, p?.discord,
      s.song1, s.song2, s.song3, selfTotal(s).toFixed(4), s.verified_total, s.status, s.video_url, s.submitted_at,
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  })
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `umai26-prelims-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div>
    <div class="grid gap-4 sm:grid-cols-4">
      <div class="card p-5">
        <p class="text-sm text-fg-muted">Submitted</p>
        <p class="font-display text-3xl font-bold text-white">{{ submissions.length }}<span class="text-lg text-fg-muted"> / {{ players.length }}</span></p>
      </div>
      <div class="card p-5"><p class="text-sm text-fg-muted">Pending</p><p class="font-display text-3xl font-bold text-gold">{{ counts.pending }}</p></div>
      <div class="card p-5"><p class="text-sm text-fg-muted">Approved</p><p class="font-display text-3xl font-bold text-emerald-300">{{ counts.approved }}</p></div>
      <div class="card p-5"><p class="text-sm text-fg-muted">Rejected</p><p class="font-display text-3xl font-bold text-rose-light">{{ counts.rejected }}</p></div>
    </div>

    <div class="mt-8 flex flex-wrap items-center justify-between gap-3">
      <div class="flex gap-1 rounded-full border border-ink-600 p-1 text-sm">
        <button
          v-for="f in (['all', 'pending', 'approved', 'rejected'] as const)"
          :key="f"
          :aria-pressed="filter === f"
          class="rounded-full px-4 py-1.5 capitalize"
          :class="filter === f ? 'bg-orchid/30 text-white' : 'text-fg-muted hover:text-white'"
          @click="filter = f"
        >
          {{ f }}
        </button>
      </div>
      <button class="btn-ghost text-sm" @click="exportCsv">Export CSV</button>
    </div>

    <p v-if="error" class="mt-4 text-sm text-rose-light" role="alert">{{ error }}</p>

    <div class="mt-4 space-y-3">
      <p v-if="!visible.length" class="text-fg-muted">No submissions yet.</p>
      <article v-for="(s, i) in visible" :key="s.id" class="card grid gap-4 p-5 lg:grid-cols-[3rem_1.2fr_1fr_1.4fr] lg:items-start">
        <div class="font-display text-2xl font-bold text-orchid-light">#{{ i + 1 }}</div>

        <div class="min-w-0">
          <p class="font-display text-lg font-semibold text-white">{{ playerById.get(s.player_id)?.ign || '(no IGN)' }}</p>
          <p class="text-sm text-fg-muted">{{ playerById.get(s.player_id)?.name }} · {{ playerById.get(s.player_id)?.university }}</p>
          <p class="text-sm text-fg-muted">Discord: {{ playerById.get(s.player_id)?.discord }}</p>
          <a :href="s.video_url" target="_blank" rel="noopener" class="mt-1 block truncate text-sm text-rose-light underline underline-offset-4">{{ s.video_url }}</a>
          <p v-if="s.notes" class="mt-2 text-sm text-fg-muted italic">"{{ s.notes }}"</p>
          <p class="mt-1 text-xs text-fg-muted/70">Submitted {{ formatDate(s.submitted_at) }}</p>
        </div>

        <div class="text-sm tabular-nums">
          <p class="text-fg-muted">Self-reported</p>
          <p>{{ s.song1 }} / {{ s.song2 }} / {{ s.song3 }}</p>
          <p class="font-semibold text-white">= {{ selfTotal(s).toFixed(4) }}%</p>
        </div>

        <form class="grid gap-2 sm:grid-cols-2" @submit.prevent="save(s)">
          <label class="text-xs text-fg-muted">
            Status
            <select v-model="s.status" class="input mt-1 py-2">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label class="text-xs text-fg-muted">
            Verified total %
            <input v-model="s.verified_total" type="number" step="0.0001" min="0" max="303" class="input mt-1 py-2 tabular-nums">
          </label>
          <label class="text-xs text-fg-muted sm:col-span-2">
            Note to player
            <input v-model="s.admin_note" class="input mt-1 py-2" placeholder="Shown on the player's portal">
          </label>
          <button type="submit" class="btn-ghost py-2 text-sm sm:col-span-2" :disabled="savingId === s.id">
            {{ savingId === s.id ? 'Saving…' : savedId === s.id ? 'Saved ✓' : 'Save' }}
          </button>
        </form>
      </article>
    </div>
  </div>
</template>
