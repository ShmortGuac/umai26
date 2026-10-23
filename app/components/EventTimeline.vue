<script setup lang="ts">
const { timeline } = useAppConfig()

const today = ref<string | null>(null)
onMounted(() => {
  // Compare in Malaysia time regardless of the viewer's timezone.
  today.value = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })
})

function status(start: string, end: string) {
  if (!today.value) return 'upcoming'
  if (today.value > end) return 'done'
  if (today.value >= start) return 'live'
  return 'upcoming'
}
</script>

<template>
  <ol class="grid gap-4 md:grid-cols-3">
    <li
      v-for="(step, i) in timeline"
      :key="step.label"
      class="card relative p-6"
      :class="status(step.start, step.end) === 'live' ? 'border-orchid/70 shadow-lg shadow-orchid/20' : ''"
    >
      <div class="flex items-center justify-between">
        <span class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-orchid-light bg-ink-700 font-display font-bold text-orchid-light">
          {{ i + 1 }}
        </span>
        <span
          v-if="status(step.start, step.end) === 'live'"
          class="flex items-center gap-1.5 rounded-full bg-rose/15 px-3 py-1 text-xs font-semibold text-rose-light"
        >
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-rose" /> Happening now
        </span>
        <span v-else-if="status(step.start, step.end) === 'done'" class="text-xs text-fg-muted">Closed</span>
      </div>
      <h3 class="mt-4 font-display text-xl font-bold text-white">{{ step.label }}</h3>
      <p class="mt-1 text-lg text-orchid-light">{{ step.display }}</p>
      <p v-if="step.note" class="mt-1 text-sm text-fg-muted">{{ step.note }}</p>
    </li>
  </ol>
</template>
