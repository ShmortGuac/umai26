<script setup lang="ts">
import type { Profile, Submission } from '~/composables/useSupabase'

useHead({ title: "Player Portal · U-mai '26" })

const supabase = useSupabase()
const { user, ready } = useAuthUser()
const { prelims, links } = useAppConfig()
const prelimWindow = usePrelimWindow()

const loading = ref(true)
const profile = ref<Profile | null>(null)
const submission = ref<Submission | null>(null)

const profileForm = reactive({ display_name: '', ign: '', university: '', discord: '' })
const subForm = reactive({ video_url: '', song1: '', song2: '', song3: '', notes: '', confirm: false })

const savingProfile = ref(false)
const savingSub = ref(false)
const message = ref<{ kind: 'ok' | 'error', text: string } | null>(null)
let messageTimer: ReturnType<typeof setTimeout> | undefined
watch(message, (m) => {
  clearTimeout(messageTimer)
  if (m) messageTimer = setTimeout(() => { message.value = null }, 5000)
})

const profileComplete = computed(() =>
  !!(profile.value?.ign && profile.value?.university && profile.value?.discord))

const selfTotal = computed(() => {
  const nums = [subForm.song1, subForm.song2, subForm.song3].map(Number)
  return nums.every(n => !Number.isNaN(n)) ? nums.reduce((a, b) => a + b, 0).toFixed(4) : '—'
})

async function load() {
  if (!supabase || !user.value) return
  loading.value = true
  const [p, s] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.value.id).maybeSingle(),
    supabase.from('prelim_submissions').select('*').eq('user_id', user.value.id).maybeSingle(),
  ])
  profile.value = p.data as Profile | null
  submission.value = s.data as Submission | null
  if (profile.value) {
    profileForm.display_name = profile.value.display_name ?? ''
    profileForm.ign = profile.value.ign ?? ''
    profileForm.university = profile.value.university ?? ''
    profileForm.discord = profile.value.discord ?? ''
  }
  if (submission.value) {
    subForm.video_url = submission.value.video_url
    subForm.song1 = submission.value.song1?.toString() ?? ''
    subForm.song2 = submission.value.song2?.toString() ?? ''
    subForm.song3 = submission.value.song3?.toString() ?? ''
    subForm.notes = submission.value.notes ?? ''
  }
  loading.value = false
}

watch(user, (u) => { if (u) load() }, { immediate: true })

async function saveProfile() {
  if (!supabase || !user.value) return
  savingProfile.value = true
  message.value = null
  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: profileForm.display_name.trim() || null,
      ign: profileForm.ign.trim() || null,
      university: profileForm.university.trim() || null,
      discord: profileForm.discord.trim() || null,
    })
    .eq('id', user.value.id)
    .select()
    .single()
  savingProfile.value = false
  if (error) message.value = { kind: 'error', text: error.message }
  else {
    profile.value = data as Profile
    message.value = { kind: 'ok', text: 'Profile saved.' }
  }
}

async function submitPrelim() {
  if (!supabase || !user.value) return
  savingSub.value = true
  message.value = null
  const { data, error } = await supabase
    .from('prelim_submissions')
    .upsert({
      user_id: user.value.id,
      video_url: subForm.video_url.trim(),
      song1: Number(subForm.song1),
      song2: Number(subForm.song2),
      song3: Number(subForm.song3),
      notes: subForm.notes.trim() || null,
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single()
  savingSub.value = false
  if (error) message.value = { kind: 'error', text: error.message }
  else {
    submission.value = data as Submission
    subForm.confirm = false
    message.value = { kind: 'ok', text: 'Submission received! We\'ll review your video soon.' }
  }
}

async function signOut() {
  await supabase?.auth.signOut()
  profile.value = null
  submission.value = null
}
</script>

<template>
  <div class="container-x pt-14">
    <PageHeader eyebrow="Players" title="Player Portal">
      Set up your player profile and submit your preliminary round video.
    </PageHeader>

    <div class="mt-10">
      <!-- Portal not wired up yet -->
      <div v-if="!supabase" class="card max-w-xl p-8">
        <h2 class="font-display text-xl font-bold text-white">Portal opening soon</h2>
        <p class="mt-2 text-fg-muted">
          The player portal isn't live yet. Keep an eye on the
          <a :href="links.discord" target="_blank" rel="noopener" class="text-rose-light underline underline-offset-4">Discord</a>
          for the announcement.
        </p>
      </div>

      <p v-else-if="!ready" class="text-fg-muted">Loading…</p>

      <PortalLogin v-else-if="!user" />

      <p v-else-if="loading" class="text-fg-muted">Loading your profile…</p>

      <div v-else class="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <!-- Profile -->
        <section class="card h-fit p-6 sm:p-8">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="font-display text-2xl font-bold text-white">Your profile</h2>
              <p class="mt-1 text-sm break-all text-fg-muted">{{ user.email }}</p>
            </div>
            <button class="text-sm text-fg-muted underline-offset-4 hover:text-white hover:underline" @click="signOut">Sign out</button>
          </div>

          <form class="mt-6 space-y-4" @submit.prevent="saveProfile">
            <div>
              <label for="p-name" class="label">Name</label>
              <input id="p-name" v-model="profileForm.display_name" class="input" autocomplete="name">
            </div>
            <div>
              <label for="p-ign" class="label">maimai DX in-game name <span class="text-rose-light">*</span></label>
              <input id="p-ign" v-model="profileForm.ign" class="input" required placeholder="e.g. ＵＭＡＩ">
              <p class="mt-1 text-xs text-fg-muted">Must stay the same for the entire tournament.</p>
            </div>
            <div>
              <label for="p-uni" class="label">University <span class="text-rose-light">*</span></label>
              <input id="p-uni" v-model="profileForm.university" class="input" required placeholder="e.g. IIUM">
            </div>
            <div>
              <label for="p-discord" class="label">Discord username <span class="text-rose-light">*</span></label>
              <input id="p-discord" v-model="profileForm.discord" class="input" required placeholder="e.g. umai_player">
            </div>
            <button type="submit" class="btn-ghost" :disabled="savingProfile">
              {{ savingProfile ? 'Saving…' : 'Save profile' }}
            </button>
          </form>

          <NuxtLink v-if="profile?.is_admin" to="/portal/admin" class="btn-primary mt-8 w-full">Open admin dashboard</NuxtLink>
        </section>

        <!-- Prelim submission -->
        <section class="card p-6 sm:p-8">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-display text-2xl font-bold text-white">Preliminary submission</h2>
            <StatusBadge v-if="submission" :status="submission.status" />
          </div>
          <p class="mt-2 text-sm text-fg-muted">
            Open {{ formatDate(prelimWindow.opens) }} until {{ formatDate(prelimWindow.closes) }} (MYT).
          </p>

          <div class="mt-5 rounded-xl border border-ink-600 bg-ink-900/50 p-4">
            <p class="text-sm font-semibold text-white">Prelim songs</p>
            <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm text-fg-muted">
              <li v-for="song in prelims.songs" :key="song">{{ song }}</li>
            </ol>
            <p class="mt-3 text-xs text-fg-muted">
              Play all 3 in <strong class="text-white">one credit</strong>, in any order, and record the whole run including the result screens.
            </p>
          </div>

          <div v-if="submission?.admin_note" class="mt-5 rounded-xl bg-rose/10 p-4 text-sm text-rose-light">
            <strong>Note from the organisers:</strong> {{ submission.admin_note }}
          </div>

          <p v-if="!profileComplete" class="mt-6 rounded-xl bg-gold/10 p-4 text-sm text-gold">
            Fill in your in-game name, university and Discord username first.
          </p>
          <p v-else-if="prelimWindow.state === 'before'" class="mt-6 rounded-xl bg-peri/10 p-4 text-sm text-peri-light">
            Submissions open on {{ formatDate(prelimWindow.opens) }}. Prelim songs will be announced in the Discord.
          </p>
          <div v-else-if="prelimWindow.state === 'closed'" class="mt-6 rounded-xl bg-ink-700/60 p-4 text-sm text-fg-muted">
            Submissions are closed.
            <template v-if="submission">
              Your video: <a :href="submission.video_url" target="_blank" rel="noopener" class="break-all text-rose-light underline">{{ submission.video_url }}</a>
            </template>
            <template v-else>We didn't receive a submission from you.</template>
          </div>

          <form v-else class="mt-6 space-y-4" @submit.prevent="submitPrelim">
            <div>
              <label for="s-video" class="label">Video link <span class="text-rose-light">*</span></label>
              <input id="s-video" v-model="subForm.video_url" type="url" required class="input" placeholder="https://youtu.be/… or Google Drive link">
              <p class="mt-1 text-xs text-fg-muted">Unlisted YouTube or a Google Drive link set to "Anyone with the link".</p>
            </div>

            <fieldset>
              <legend class="label">Achievement % (as shown on the result screen)</legend>
              <div class="grid gap-3 sm:grid-cols-3">
                <div v-for="n in 3" :key="n">
                  <label :for="`s-song${n}`" class="mb-1 block text-xs text-fg-muted">Song {{ n }}</label>
                  <input
                    :id="`s-song${n}`"
                    v-model="subForm[`song${n}` as 'song1' | 'song2' | 'song3']"
                    type="number" step="0.0001" min="0" max="101" required
                    class="input tabular-nums" placeholder="100.5000"
                  >
                </div>
              </div>
              <p class="mt-2 text-sm text-fg-muted">Total: <span class="font-semibold text-white tabular-nums">{{ selfTotal }}%</span></p>
            </fieldset>

            <div>
              <label for="s-notes" class="label">Notes (optional)</label>
              <textarea id="s-notes" v-model="subForm.notes" rows="3" class="input" placeholder="Arcade location, anything we should know…" />
            </div>

            <label class="flex items-start gap-3 text-sm text-fg">
              <input v-model="subForm.confirm" type="checkbox" required class="mt-1 h-4 w-4 accent-orchid">
              I played all 3 songs in a single credit on my registered Aime / Banapassport account.
            </label>

            <button type="submit" class="btn-primary w-full" :disabled="savingSub || !subForm.confirm">
              {{ savingSub ? 'Submitting…' : submission ? 'Update submission' : 'Submit prelim' }}
            </button>
            <p v-if="submission" class="text-xs text-fg-muted">
              Last submitted {{ formatDate(submission.submitted_at) }}. Updating puts your entry back under review.
            </p>
          </form>
        </section>
      </div>

      <p
        v-if="message"
        class="fixed right-4 bottom-4 z-50 max-w-sm rounded-xl px-4 py-3 text-sm shadow-xl"
        :class="message.kind === 'ok' ? 'bg-emerald-500/90 text-white' : 'bg-rose text-white'"
        role="status"
        @click="message = null"
      >
        {{ message.text }}
      </p>
    </div>
  </div>
</template>
