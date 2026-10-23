<script setup lang="ts">
import type { Profile, Submission } from '~/composables/useSupabase'

useHead({ title: "Admin · U-mai '26" })

type Row = Submission & { profiles: Profile | null }

const supabase = useSupabase()
const { user, ready } = useAuthUser()

const isAdmin = ref<boolean | null>(null)
const rows = ref<Row[]>([])
const playerCount = ref(0)
const filter = ref<'all' | Submission['status']>('all')
const savingId = ref<string | null>(null)
const error = ref('')

const selfTotal = (r: Row) => (r.song1 ?? 0) + (r.song2 ?? 0) + (r.song3 ?? 0)
// Seed on the verified total when there is one, otherwise the self-reported total.
const seedScore = (r: Row) => r.verified_total ?? selfTotal(r)

const visible = computed(() =>
  rows.value
    .filter(r => filter.value === 'all' || r.status === filter.value)
    .sort((a, b) => seedScore(b) - seedScore(a)))

const counts = computed(() => ({
  pending: rows.value.filter(r => r.status === 'pending').length,
  approved: rows.value.filter(r => r.status === 'approved').length,
  rejected: rows.value.filter(r => r.status === 'rejected').length,
}))

async function load() {
  if (!supabase || !user.value) return
  const me = await supabase.from('profiles').select('is_admin').eq('id', user.value.id).maybeSingle()
  isAdmin.value = !!me.data?.is_admin
  if (!isAdmin.value) return

  const [subs, players] = await Promise.all([
    supabase.from('prelim_submissions').select('*, profiles(*)'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])
  if (subs.error) error.value = subs.error.message
  rows.value = (subs.data ?? []) as Row[]
  playerCount.value = players.count ?? 0
}

watch(user, (u) => { if (u) load() }, { immediate: true })

async function save(r: Row) {
  if (!supabase) return
  savingId.value = r.id
  error.value = ''
  const { error: err } = await supabase
    .from('prelim_submissions')
    .update({
      status: r.status,
      verified_total: r.verified_total === null || (r.verified_total as unknown) === '' ? null : Number(r.verified_total),
      admin_note: r.admin_note?.trim() || null,
    })
    .eq('id', r.id)
  savingId.value = null
  if (err) error.value = err.message
}

function exportCsv() {
  const header = ['seed', 'ign', 'name', 'university', 'discord', 'song1', 'song2', 'song3', 'self_total', 'verified_total', 'status', 'video_url', 'submitted_at']
  const lines = visible.value.map((r, i) => [
    i + 1, r.profiles?.ign, r.profiles?.display_name, r.profiles?.university, r.profiles?.discord,
    r.song1, r.song2, r.song3, selfTotal(r).toFixed(4), r.verified_total, r.status, r.video_url, r.submitted_at,
  ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `umai26-prelims-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div class="container-x pt-14">
    <PageHeader eyebrow="Organisers" title="Prelim Review" />

    <div class="mt-10">
      <p v-if="!supabase" class="text-fg-muted">Supabase is not configured.</p>
      <p v-else-if="!ready || (user && isAdmin === null)" class="text-fg-muted">Loading…</p>
      <div v-else-if="!user || !isAdmin" class="card max-w-md p-8">
        <p class="text-fg">This page is for organisers only.</p>
        <NuxtLink to="/portal" class="btn-ghost mt-4">Back to portal</NuxtLink>
      </div>

      <template v-else>
        <div class="grid gap-4 sm:grid-cols-4">
          <div class="card p-5"><p class="text-sm text-fg-muted">Players signed up</p><p class="font-display text-3xl font-bold text-white">{{ playerCount }}</p></div>
          <div class="card p-5"><p class="text-sm text-fg-muted">Pending</p><p class="font-display text-3xl font-bold text-gold">{{ counts.pending }}</p></div>
          <div class="card p-5"><p class="text-sm text-fg-muted">Approved</p><p class="font-display text-3xl font-bold text-emerald-300">{{ counts.approved }}</p></div>
          <div class="card p-5"><p class="text-sm text-fg-muted">Rejected</p><p class="font-display text-3xl font-bold text-rose-light">{{ counts.rejected }}</p></div>
        </div>

        <div class="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div class="flex gap-1 rounded-full border border-ink-600 p-1 text-sm" role="tablist">
            <button
              v-for="f in (['all', 'pending', 'approved', 'rejected'] as const)"
              :key="f"
              role="tab"
              :aria-selected="filter === f"
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
          <article v-for="(r, i) in visible" :key="r.id" class="card grid gap-4 p-5 lg:grid-cols-[3rem_1.2fr_1fr_1.4fr] lg:items-start">
            <div class="font-display text-2xl font-bold text-orchid-light">#{{ i + 1 }}</div>

            <div class="min-w-0">
              <p class="font-display text-lg font-semibold text-white">{{ r.profiles?.ign || '(no IGN)' }}</p>
              <p class="text-sm text-fg-muted">{{ r.profiles?.display_name }} · {{ r.profiles?.university }}</p>
              <p class="text-sm text-fg-muted">Discord: {{ r.profiles?.discord }}</p>
              <a :href="r.video_url" target="_blank" rel="noopener" class="mt-1 block truncate text-sm text-rose-light underline underline-offset-4">{{ r.video_url }}</a>
              <p v-if="r.notes" class="mt-2 text-sm text-fg-muted italic">"{{ r.notes }}"</p>
              <p class="mt-1 text-xs text-fg-muted/70">Submitted {{ formatDate(r.submitted_at) }}</p>
            </div>

            <div class="text-sm tabular-nums">
              <p class="text-fg-muted">Self-reported</p>
              <p>{{ r.song1 }} / {{ r.song2 }} / {{ r.song3 }}</p>
              <p class="font-semibold text-white">= {{ selfTotal(r).toFixed(4) }}%</p>
            </div>

            <form class="grid gap-2 sm:grid-cols-2" @submit.prevent="save(r)">
              <label class="text-xs text-fg-muted">
                Status
                <select v-model="r.status" class="input mt-1 py-2">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label class="text-xs text-fg-muted">
                Verified total %
                <input v-model="r.verified_total" type="number" step="0.0001" min="0" max="303" class="input mt-1 py-2 tabular-nums">
              </label>
              <label class="text-xs text-fg-muted sm:col-span-2">
                Note to player
                <input v-model="r.admin_note" class="input mt-1 py-2" placeholder="Shown on the player's portal">
              </label>
              <button type="submit" class="btn-ghost py-2 text-sm sm:col-span-2" :disabled="savingId === r.id">
                {{ savingId === r.id ? 'Saving…' : 'Save' }}
              </button>
            </form>
          </article>
        </div>
      </template>
    </div>
  </div>
</template>
