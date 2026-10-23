<script setup lang="ts">
import type { Player, Submission } from '~/composables/useSupabase'

useHead({ title: "Admin · U-mai '26" })

const supabase = useSupabase()
const { user, ready } = useAuthUser()

const isAdmin = ref<boolean | null>(null)
const players = ref<Player[]>([])
const submissions = ref<Submission[]>([])
const error = ref('')
const tab = ref<'submissions' | 'players'>('submissions')

async function load() {
  if (!supabase || !user.value) return
  const me = await supabase.rpc('is_admin')
  isAdmin.value = !!me.data
  if (!isAdmin.value) return

  const [p, s] = await Promise.all([
    supabase.from('players').select('*').order('imported_at'),
    supabase.from('prelim_submissions').select('*'),
  ])
  error.value = p.error?.message ?? s.error?.message ?? ''
  players.value = (p.data ?? []) as Player[]
  submissions.value = (s.data ?? []) as Submission[]
}

watch(user, (u) => { if (u) load() }, { immediate: true })

const tabs = computed(() => [
  { key: 'submissions' as const, label: 'Submissions', count: submissions.value.length },
  { key: 'players' as const, label: 'Players', count: players.value.length },
])
</script>

<template>
  <div class="container-x pt-14">
    <PageHeader eyebrow="Organisers" title="Admin Dashboard" />

    <div class="mt-10">
      <p v-if="!supabase" class="text-fg-muted">Supabase is not configured.</p>
      <p v-else-if="!ready || (user && isAdmin === null)" class="text-fg-muted">Loading…</p>
      <div v-else-if="!user || !isAdmin" class="card max-w-md p-8">
        <p class="text-fg">This page is for organisers only.</p>
        <NuxtLink to="/portal" class="btn-ghost mt-4">Back to portal</NuxtLink>
      </div>

      <template v-else>
        <div class="flex gap-1 border-b border-ink-600" role="tablist">
          <button
            v-for="t in tabs"
            :key="t.key"
            role="tab"
            :aria-selected="tab === t.key"
            class="-mb-px border-b-2 px-5 py-3 font-display font-semibold"
            :class="tab === t.key ? 'border-orchid-light text-white' : 'border-transparent text-fg-muted hover:text-white'"
            @click="tab = t.key"
          >
            {{ t.label }} <span class="ml-1 rounded-full bg-ink-700 px-2 py-0.5 text-xs">{{ t.count }}</span>
          </button>
        </div>

        <p v-if="error" class="mt-4 text-sm text-rose-light" role="alert">{{ error }}</p>

        <div class="mt-8">
          <AdminSubmissions v-if="tab === 'submissions'" :players="players" :submissions="submissions" />
          <AdminPlayers v-else :players="players" :submissions="submissions" @changed="load" />
        </div>
      </template>
    </div>
  </div>
</template>
