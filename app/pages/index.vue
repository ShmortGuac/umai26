<script setup lang="ts">
const { event, links } = useAppConfig()

const facts = [
  { title: 'Double Elimination', body: 'Lose once and you drop to the lower bracket. You are only out after two losses.' },
  { title: 'Top 16 Qualify', body: 'The best 16 from the online prelims play the finals in person.' },
  { title: `${event.fee} Entry`, body: 'One entry per person. Fees cover the cost of running the event.' },
  { title: 'Online → Offline', body: 'Record your prelim run at any arcade, then meet us at the venue for the finals.' },
]

const steps = [
  { title: 'Register', body: 'Fill in the registration form with your student ID photo and pay the RM20 fee.' },
  { title: 'Join the Discord', body: 'All announcements, prelim songs and contact go through the Discord server.' },
  { title: 'Play the prelims', body: 'Record the 3 prelim songs in one credit and submit your video as announced in the Discord.' },
  { title: 'Make the top 16', body: 'Qualifiers are seeded from prelim results and play at Sunway Wangsa Walk.' },
]

const faqs = [
  { q: 'Who can join?', a: 'Any student at a university or higher education institution with an active matric/student number. You will upload a photo of your student ID as proof.' },
  { q: 'Do I need to be a top player?', a: 'Not at all. U-mai is for the university maimai community at every level. The prelims decide seeding and the top 16.' },
  { q: 'Prelims have started. Can I still register?', a: 'Yes! Registration stays open until prelims close on 29 November. Just make sure you register and submit your prelim video before the deadline.' },
  { q: 'How do I submit my prelim run?', a: 'Record yourself playing all 3 prelim songs in a single credit, upload the video (unlisted YouTube or Google Drive), and submit the link before 29 November. Submission details will be announced in the Discord.' },
  { q: 'Can I switch maimai accounts mid-tournament?', a: 'No. You must use the same Aime / Banapassport account and the same in-game name for the whole tournament.' },
  { q: 'How are matches decided?', a: 'Each match is a 4-song set from an 8-chart pool. Highest total Achievement % wins, then DX Score, then a tiebreaker chart if still tied.' },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="container-x flex flex-col items-center pt-14 pb-20 text-center sm:pt-20">
      <p class="eyebrow">12 December 2026 · {{ event.venue }}</p>
      <h1 class="sr-only">U-mai '26: University maimai Tournament</h1>
      <img
        src="/img/logo.png"
        alt="U-mai '26 University maimai Tournament"
        class="mt-8 w-full max-w-xl drop-shadow-[0_10px_40px_rgba(217,77,227,0.35)]"
      >
      <p class="mt-8 max-w-xl text-lg text-fg-muted">
        A maimai DX tournament for university students across Malaysia. Qualify online, then battle it out live in the finals.
      </p>
      <div class="mt-8">
        <Countdown :target="event.finalsDate" />
      </div>
      <div class="mt-10 flex flex-wrap justify-center gap-3">
        <a :href="links.registration" target="_blank" rel="noopener" class="btn-primary px-7 py-3 text-lg">Register now</a>
        <NuxtLink to="/rules" class="btn-ghost px-7 py-3 text-lg">Read the rules</NuxtLink>
      </div>
    </section>

    <!-- Quick facts -->
    <section class="container-x">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="f in facts" :key="f.title" class="card p-6">
          <h3 class="font-display text-xl font-bold text-gradient">{{ f.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-fg-muted">{{ f.body }}</p>
        </div>
      </div>
    </section>

    <!-- What is U-mai -->
    <section class="container-x mt-24 grid items-center gap-10 md:grid-cols-2">
      <div>
        <p class="eyebrow">About</p>
        <h2 class="heading-section mt-2">What is <span class="text-gradient">U-mai</span>?</h2>
        <p class="mt-5 leading-relaxed text-fg-muted">
          U-mai is a maimai tournament made for university students. It is self-hosted by the community,
          and donations go into running the event and the prize pool.
        </p>
        <p class="mt-4 leading-relaxed text-fg-muted">
          The tournament runs in two stages: an <strong class="text-white">online preliminary</strong>, where everyone records
          a run of three songs, and a <strong class="text-white">physical final stage</strong>, where the top 16 meet in a
          double-elimination bracket at {{ event.venue }}.
        </p>
      </div>
      <div class="card p-6 sm:p-8">
        <p class="eyebrow">How to join</p>
        <ol class="mt-5 space-y-5">
          <li v-for="(s, i) in steps" :key="s.title" class="flex gap-4">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-peri to-orchid font-display font-bold text-white">{{ i + 1 }}</span>
            <div>
              <h3 class="font-display font-semibold text-white">{{ s.title }}</h3>
              <p class="text-sm text-fg-muted">{{ s.body }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <MascotSection />

    <!-- Timeline -->
    <section class="container-x mt-24">
      <p class="eyebrow">Timeline</p>
      <h2 class="heading-section mt-2">Key dates</h2>
      <div class="mt-8">
        <EventTimeline />
      </div>
    </section>

    <PrizePool />

    <!-- Donate teaser -->
    <section class="container-x mt-24">
      <div class="card relative overflow-hidden p-8 sm:p-12">
        <div class="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-rose/20 blur-3xl" aria-hidden="true" />
        <div class="relative max-w-2xl">
          <p class="eyebrow">Support U-mai</p>
          <h2 class="heading-section mt-2">Help us grow the prize pool</h2>
          <p class="mt-4 text-fg-muted">
            U-mai is entirely self-hosted. Donations of any amount fund the event and go straight into the prize pool.
            Donate more than {{ event.donationGiftThreshold }} and we'll send a special gift your way.
          </p>
          <NuxtLink to="/donate" class="btn-primary mt-6">Donate</NuxtLink>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="container-x mt-24">
      <p class="eyebrow">FAQ</p>
      <h2 class="heading-section mt-2">Questions</h2>
      <div class="mt-8 space-y-3">
        <details v-for="f in faqs" :key="f.q" class="card group p-5 open:border-orchid/50">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-white">
            {{ f.q }}
            <span class="text-2xl leading-none text-orchid-light transition group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <p class="mt-3 leading-relaxed text-fg-muted">{{ f.a }}</p>
        </details>
      </div>
      <p class="mt-6 text-sm text-fg-muted">
        Still unsure? Ask in the <a :href="links.discord" target="_blank" rel="noopener" class="text-rose-light underline underline-offset-4">Discord server</a>.
      </p>
    </section>
  </div>
</template>
