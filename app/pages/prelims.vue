<script setup lang="ts">
const { links, prelims } = useAppConfig()
useHead({ title: "Prelims · U-mai '26" })

const opensAt = new Date(prelims.opensAt).getTime()
const closesAt = new Date(prelims.closesAt).getTime()

// Seeded with the server clock and serialised into the payload, so the first paint is correct.
const now = useState('prelims-now', () => Date.now())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  now.value = Date.now()
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const status = computed<'upcoming' | 'live' | 'closed'>(() => {
  if (now.value < opensAt) return 'upcoming'
  if (now.value > closesAt) return 'closed'
  return 'live'
})

const statusLabel = computed(() => ({ upcoming: 'Starts soon', live: 'Live now', closed: 'Closed' })[status.value])

const statusTitle = computed(() => ({
  upcoming: 'Prelims start soon',
  live: 'Prelims are live',
  closed: 'Prelims have closed',
})[status.value])

const statusBody = computed(() => ({
  upcoming: 'The preliminary round runs online. Songs and submission details will be announced in the Discord.',
  live: 'Registration is still open. Play the three songs below in one credit, record your run and submit it before the deadline.',
  closed: 'Submissions are closed. Qualifiers and seeding will be announced in the Discord.',
})[status.value])

const progress = computed(() => {
  const pct = ((now.value - opensAt) / (closesAt - opensAt)) * 100
  return Math.min(100, Math.max(0, Math.round(pct)))
})

const countdownLabel = computed(() => (status.value === 'upcoming' ? 'Prelims close in' : 'Time left to submit'))

const steps = [
  { title: 'Record one credit', body: 'Film yourself playing all three songs in a single credit, in any order. Keep the results screen in the video.' },
  { title: 'Upload the video', body: 'Use an unlisted YouTube link or a Google Drive file that anyone with the link can view.' },
  { title: 'Submit it in the Discord', body: `Post the link in the server before ${prelims.deadline}. The exact submission channel is announced there.` },
  { title: 'Make the top 16', body: 'Every valid submission is ranked to decide seeding, and the top 16 head to the finals at Sunway Wangsa Walk.' },
]
</script>

<template>
  <div class="container-x pt-14">
    <PageHeader eyebrow="Stage 1 · Online" title="Preliminary Round">
      Play the three prelim songs, record the run and submit it before the deadline. Everyone who registers has a shot at the top 16.
      <template #actions>
        <a :href="links.discord" target="_blank" rel="noopener" class="btn-primary">Join the Discord</a>
      </template>
    </PageHeader>

    <!-- Status + countdown -->
    <section class="card mt-10 p-6 sm:p-8" aria-labelledby="prelims-status">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span
            class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase"
            :class="{
              'bg-rose/15 text-rose-light': status === 'live',
              'bg-peri/15 text-peri-light': status === 'upcoming',
              'bg-ink-700 text-fg-muted': status === 'closed',
            }"
          >
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="{
                'animate-pulse bg-rose': status === 'live',
                'bg-peri-light': status === 'upcoming',
                'bg-fg-muted': status === 'closed',
              }"
            />
            {{ statusLabel }}
          </span>
          <h2 id="prelims-status" class="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">{{ statusTitle }}</h2>
          <p class="mt-2 max-w-xl leading-relaxed text-fg-muted">{{ statusBody }}</p>
          <p class="mt-4 text-sm text-fg-muted">Online · {{ prelims.window }}</p>
        </div>

        <div v-if="status !== 'closed'" class="shrink-0">
          <p class="eyebrow text-center">{{ countdownLabel }}</p>
          <Countdown
            :target="prelims.closesAt"
            label="Countdown to the end of the preliminary round"
            class="mt-3 justify-center"
          />
        </div>
      </div>

      <div class="mt-8">
        <div class="h-2 overflow-hidden rounded-full bg-ink-900/80" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100" aria-label="Preliminary round progress">
          <div
            class="h-full rounded-full bg-gradient-to-r from-peri via-orchid to-rose transition-[width] duration-1000 ease-linear"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <div class="mt-2 flex justify-between text-xs text-fg-muted">
          <span>Opened 15 Nov</span>
          <span>{{ status === 'closed' ? 'Closed' : `${progress}% elapsed` }}</span>
          <span>Closes 29 Nov</span>
        </div>
      </div>
    </section>

    <!-- Songs -->
    <section class="mt-16" aria-labelledby="prelim-songs">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow">Prelim songs</p>
          <h2 id="prelim-songs" class="heading-section mt-2">Three songs, one credit</h2>
        </div>
        <p class="max-w-sm text-sm leading-relaxed text-fg-muted">
          Play them in any order. All three must be in the same credit and in a single recording.
        </p>
      </div>

      <div class="mt-8 grid gap-5 sm:grid-cols-3">
        <article v-for="song in prelims.songs" :key="song.title" class="card group overflow-hidden p-4">
          <div class="relative overflow-hidden rounded-xl bg-ink-900/60 p-3">
            <img
              :src="song.img"
              :alt="`${song.title} chart card: ${song.difficulty} level ${song.level}, ${song.type}`"
              class="mx-auto w-full max-w-72 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              loading="lazy"
            >
          </div>
          <h3 class="mt-4 font-display text-lg font-bold leading-snug text-white">{{ song.title }}</h3>
          <p class="mt-1 text-sm text-fg-muted">{{ song.artist }}</p>
          <p class="mt-3 flex flex-wrap gap-2">
            <span class="rounded-full border border-fg/15 px-2.5 py-0.5 text-xs text-fg">{{ song.type }}</span>
            <span class="rounded-full border border-orchid/40 bg-orchid/10 px-2.5 py-0.5 text-xs font-semibold text-orchid-light">
              {{ song.difficulty }} {{ song.level }}
            </span>
          </p>
        </article>
      </div>
    </section>

    <!-- Submission -->
    <section class="mt-16 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div class="card p-6 sm:p-8">
        <p class="eyebrow">Submission</p>
        <h2 class="mt-2 font-display text-2xl font-bold text-white">How to submit your run</h2>
        <ol class="mt-6 space-y-5">
          <li v-for="(s, i) in steps" :key="s.title" class="flex gap-4">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-peri to-orchid font-display font-bold text-white">{{ i + 1 }}</span>
            <div>
              <h3 class="font-display font-semibold text-white">{{ s.title }}</h3>
              <p class="text-sm leading-relaxed text-fg-muted">{{ s.body }}</p>
            </div>
          </li>
        </ol>
      </div>

      <aside class="card flex flex-col p-6 sm:p-8">
        <p class="eyebrow">Deadline</p>
        <p class="mt-2 font-display text-2xl font-bold text-white">{{ prelims.deadline }}</p>
        <p class="mt-3 text-sm leading-relaxed text-fg-muted">
          Runs submitted after the deadline can't be counted. If something goes wrong, ask in the Discord before it closes.
        </p>
        <ul class="mt-5 space-y-2.5 text-sm leading-relaxed text-fg-muted">
          <li class="flex gap-2.5">
            <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orchid-light" aria-hidden="true" />
            One entry per person.
          </li>
          <li class="flex gap-2.5">
            <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orchid-light" aria-hidden="true" />
            Same Aime / Banapassport account and in-game name for the whole tournament.
          </li>
          <li class="flex gap-2.5">
            <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orchid-light" aria-hidden="true" />
            Open to university and higher-education students with a valid student ID.
          </li>
        </ul>
        <div class="mt-auto space-y-3 pt-6">
          <a :href="links.discord" target="_blank" rel="noopener" class="btn-primary w-full">Join the Discord</a>
          <NuxtLink to="/rules#prelims" class="btn-ghost w-full">Full prelim rules</NuxtLink>
        </div>
      </aside>
    </section>
  </div>
</template>
