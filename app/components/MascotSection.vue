<script setup lang="ts">
const mascots = [
  {
    name: 'Yuina',
    role: 'Main mascot',
    img: '/img/yuina.png',
    accent: 'from-orchid to-peri',
    thumbPos: 'scale-150 object-[50%_0%] origin-top',
    tags: ['College student', 'Rhythm game fan', 'Happy-go-lucky'],
    bio: "A happy-go-lucky college girl who can't get enough of rhythm games. Yuina is the face of U-mai, cheering on every player from the first prelim to the Grand Finals.",
  },
  {
    name: 'Tofu',
    role: 'Loyal companion',
    img: '/img/tofu.png',
    accent: 'from-peri to-peri-light',
    thumbPos: 'object-[50%_20%]',
    tags: ['Seal', 'Best friend', 'Never far behind'],
    bio: "A lovable seal who's always by Yuina's side. Wherever she goes, Tofu follows. Yes, even to the arcade.",
  },
]
</script>

<template>
  <section class="container-x mt-24" aria-labelledby="mascots-heading">
    <div class="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
      <!-- Art: Yuina with Tofu tagging along at her side -->
      <div class="relative mx-auto flex h-[26rem] w-full max-w-md items-end justify-center sm:h-[30rem]" aria-hidden="true">
        <div class="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-orchid/40 via-peri/25 to-rose/30 blur-2xl sm:h-80 sm:w-80" />
        <div class="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orchid-light/20 sm:h-96 sm:w-96" />
        <div class="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-peri-light/20 sm:h-72 sm:w-72" />
        <img
          src="/img/yuina.png"
          alt=""
          class="mascot-float relative z-10 mb-6 h-[22rem] w-auto drop-shadow-[0_20px_30px_rgba(20,17,25,0.6)] sm:h-[26rem]"
        >
        <img
          src="/img/tofu.png"
          alt=""
          class="mascot-bob absolute right-2 bottom-2 z-20 h-32 w-auto drop-shadow-[0_10px_20px_rgba(20,17,25,0.6)] sm:right-6 sm:h-36"
        >
      </div>

      <div>
        <p class="eyebrow">Mascots</p>
        <h2 id="mascots-heading" class="heading-section mt-2">Meet <span class="text-gradient">Yuina</span> &amp; <span class="text-gradient">Tofu</span></h2>
        <p class="mt-4 text-fg-muted">The two faces you'll see all over U-mai '26.</p>

        <div class="mt-8 space-y-4">
          <article v-for="m in mascots" :key="m.name" class="card flex gap-5 p-5 sm:p-6">
            <div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br sm:h-24 sm:w-24" :class="m.accent">
              <img :src="m.img" :alt="m.name" class="h-full w-full object-cover" :class="m.thumbPos">
            </div>
            <div class="min-w-0">
              <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 class="font-display text-2xl font-bold text-white">{{ m.name }}</h3>
                <span class="text-sm text-rose-light">{{ m.role }}</span>
              </div>
              <p class="mt-2 text-sm leading-relaxed text-fg-muted">{{ m.bio }}</p>
              <ul class="mt-3 flex flex-wrap gap-2">
                <li v-for="t in m.tags" :key="t" class="rounded-full border border-fg/15 px-2.5 py-0.5 text-xs text-fg">{{ t }}</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes bob {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-6px) rotate(3deg); }
}
.mascot-float { animation: float 5s ease-in-out infinite; }
.mascot-bob { animation: bob 2.6s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .mascot-float, .mascot-bob { animation: none; }
}
</style>
