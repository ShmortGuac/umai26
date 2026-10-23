<script setup lang="ts">
const { event, links } = useAppConfig()
useHead({ title: "Donate · U-mai '26" })

const uses = [
  { title: 'Prize pool', body: 'Donations contribute directly to the prizes for the top players.' },
  { title: 'Running the event', body: 'Venue costs, equipment, streaming and everything else on finals day.' },
  { title: 'A thank-you gift', body: `Donate more than ${event.donationGiftThreshold} and receive a special U-mai gift.` },
]
</script>

<template>
  <div class="container-x pt-14">
    <PageHeader eyebrow="Support" title="Donate to U-mai">
      U-mai is a self-hosted community event, so we gladly accept donations of any amount :D
    </PageHeader>

    <div class="mt-12 grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
        <div v-for="u in uses" :key="u.title" class="card p-6">
          <h2 class="font-display text-xl font-bold text-gradient">{{ u.title }}</h2>
          <p class="mt-2 text-fg-muted">{{ u.body }}</p>
        </div>
      </div>

      <aside class="card flex flex-col items-center p-8 text-center">
        <p class="eyebrow">Donate</p>
        <!-- Set links.donationQr in app.config.ts once the DuitNow / TnG QR is in public/img -->
        <div class="mt-5 flex aspect-square w-full max-w-60 items-center justify-center rounded-2xl border-2 border-dashed border-ink-600 bg-ink-900/60 p-4">
          <img v-if="links.donationQr" :src="links.donationQr" alt="Donation QR code" class="h-full w-full rounded-lg object-contain">
          <span v-else class="text-sm text-fg-muted">QR coming soon</span>
        </div>
        <a :href="links.donation" target="_blank" rel="noopener" class="btn-primary mt-6 w-full">Donate now</a>
        <p class="mt-4 text-xs text-fg-muted">
          After donating, drop your receipt in the Discord so we can send your gift.
        </p>
      </aside>
    </div>
  </div>
</template>
