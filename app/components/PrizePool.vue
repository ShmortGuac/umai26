<script setup lang="ts">
const { prizePool } = useAppConfig()

// Podium order on wide screens: 2nd, 1st, 3rd.
const styles = [
  { order: 'sm:order-2', height: 'sm:pt-12', medal: 'from-gold to-[#f3e3a8]', ring: 'border-gold/50' },
  { order: 'sm:order-1', height: 'sm:pt-8', medal: 'from-peri-light to-[#eef0ff]', ring: 'border-peri/40' },
  { order: 'sm:order-3', height: 'sm:pt-6', medal: 'from-rose to-orchid', ring: 'border-rose/40' },
]
</script>

<template>
  <section class="container-x mt-24">
    <p class="eyebrow">Prize pool</p>
    <div class="mt-2 flex flex-wrap items-end justify-between gap-4">
      <h2 class="heading-section">What's up for grabs</h2>
      <p class="text-right">
        <span class="block text-xs tracking-widest text-fg-muted uppercase">Current total</span>
        <span class="font-display text-4xl font-bold text-gradient sm:text-5xl">{{ prizePool.total }}</span>
      </p>
    </div>

    <div class="mt-8 grid items-end gap-4 sm:grid-cols-3">
      <div
        v-for="(p, i) in prizePool.places"
        :key="p.place"
        class="card flex flex-col items-center p-6 text-center"
        :class="[styles[i]?.order, styles[i]?.height, styles[i]?.ring]"
      >
        <span
          class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br font-display text-xl font-bold text-ink-900 shadow-lg"
          :class="styles[i]?.medal"
        >{{ p.place }}</span>
        <p class="mt-4 font-display text-3xl font-bold text-white">{{ p.amount }}</p>
        <p class="mt-1 text-sm text-fg-muted">{{ p.place }} place</p>
      </div>
    </div>

    <p class="mt-6 text-sm text-fg-muted">
      The pool grows with every donation.
      <NuxtLink to="/donate" class="text-rose-light underline underline-offset-4">Chip in</NuxtLink>
      to make it bigger.
    </p>
  </section>
</template>
