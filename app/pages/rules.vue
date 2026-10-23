<script setup lang="ts">
const { links } = useAppConfig()
useHead({ title: "Rulebook · U-mai '26" })
</script>

<template>
  <div class="container-x pt-14">
    <PageHeader eyebrow="Docs" title="Rulebook">
      Everything you need to know about how U-mai '26 is run. If anything here conflicts with an announcement in the Discord, the latest announcement wins.
      <template #actions>
        <a :href="links.rulebookPdf" download class="btn-ghost">Download PDF</a>
        <a :href="links.discord" target="_blank" rel="noopener" class="btn-ghost">Join the Discord</a>
      </template>
    </PageHeader>

    <div class="mt-12 grid gap-10 lg:grid-cols-[14rem_1fr]">
      <nav class="hidden lg:block" aria-label="Rulebook sections">
        <ul class="sticky top-24 space-y-1 border-l border-ink-600">
          <li v-for="s in rules" :key="s.id">
            <a :href="`#${s.id}`" class="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-fg-muted hover:border-orchid-light hover:text-white">
              {{ s.title }}
            </a>
          </li>
          <li>
            <a href="#schedule" class="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-fg-muted hover:border-orchid-light hover:text-white">
              Finals Day Schedule
            </a>
          </li>
        </ul>
      </nav>

      <div class="space-y-6">
        <section v-for="s in rules" :id="s.id" :key="s.id" class="card scroll-mt-24 p-6 sm:p-8">
          <h2 class="font-display text-2xl font-bold text-white">{{ s.title }}</h2>
          <ul class="prose-rules mt-4 space-y-2.5 text-fg">
            <!-- renderRule escapes HTML before adding <strong>, so v-html is safe here -->
            <li v-for="(item, i) in s.items" :key="i" v-html="renderRule(item)" />
          </ul>
        </section>

        <section id="schedule" class="card scroll-mt-24 p-6 sm:p-8">
          <h2 class="font-display text-2xl font-bold text-white">Finals Day Schedule</h2>
          <p class="mt-2 text-sm text-fg-muted">12 December 2026. Times are tentative.</p>
          <ScheduleTable class="mt-5" />
        </section>
      </div>
    </div>
  </div>
</template>
