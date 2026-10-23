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
      <div class="grid content-start gap-4 sm:grid-cols-3 lg:grid-cols-1">
        <div v-for="u in uses" :key="u.title" class="card p-6">
          <h2 class="font-display text-xl font-bold text-gradient">{{ u.title }}</h2>
          <p class="mt-2 text-fg-muted">{{ u.body }}</p>
        </div>
      </div>

      <aside class="card flex flex-col items-center p-8 text-center">
        <p class="eyebrow">Donate</p>
        <template v-if="links.donationQr">
          <img :src="links.donationQr" alt="DuitNow QR code for donations" class="mt-5 w-full max-w-60 rounded-2xl shadow-xl shadow-rose/10">
          <p class="mt-4 text-sm text-fg-muted">
            Scan with any Malaysian banking or e-wallet app (DuitNow QR).
          </p>
          <a :href="links.donationQr" download="umai26-donation-qr.png" class="btn-primary mt-5 w-full">Save QR</a>
        </template>
        <div v-else class="mt-5 flex aspect-square w-full max-w-60 items-center justify-center rounded-2xl border-2 border-dashed border-ink-600 bg-ink-900/60 p-4">
          <span class="text-sm text-fg-muted">QR coming soon</span>
        </div>
        <a v-if="links.donation" :href="links.donation" target="_blank" rel="noopener" class="btn-ghost mt-3 w-full">Donate online</a>
        <p class="mt-4 text-xs text-fg-muted">
          After donating, drop your receipt in the
          <a :href="links.discord" target="_blank" rel="noopener" class="text-rose-light underline underline-offset-4">Discord</a>
          so we can send your gift.
        </p>
      </aside>
    </div>
  </div>
</template>
