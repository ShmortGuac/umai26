<script setup lang="ts">
const { event } = useAppConfig()
useHead({ title: "Schedule & Venue · U-mai '26" })
</script>

<template>
  <div class="container-x pt-14">
    <PageHeader eyebrow="When & where" title="Schedule & Venue">
      Registrations and prelims run online. The top 16 meet at {{ event.venue }} on Saturday, 12 December 2026.
    </PageHeader>

    <section class="mt-12">
      <h2 class="font-display text-2xl font-bold text-white">Tournament timeline</h2>
      <div class="mt-5">
        <EventTimeline />
      </div>
    </section>

    <section class="mt-16 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 class="font-display text-2xl font-bold text-white">Finals day</h2>
        <p class="mt-1 text-sm text-fg-muted">Times are tentative and may shift on the day.</p>
        <ScheduleTable class="mt-5" />
      </div>

      <div>
        <h2 class="font-display text-2xl font-bold text-white">Venue</h2>
        <div class="card mt-5 overflow-hidden">
          <iframe
            title="Map of Sunway Wangsa Walk"
            class="h-64 w-full border-0 grayscale-[30%] invert-[90%] hue-rotate-180"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            src="https://maps.google.com/maps?q=Wangsa+Walk+Mall,+Kuala+Lumpur&z=15&output=embed"
          />
          <div class="p-6">
            <h3 class="font-display text-xl font-bold text-white">{{ event.venue }}</h3>
            <p class="mt-1 text-sm text-fg-muted">{{ event.venueAddress }}</p>
            <a :href="event.mapsUrl" target="_blank" rel="noopener" class="btn-ghost mt-4 text-sm">Open in Google Maps</a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
