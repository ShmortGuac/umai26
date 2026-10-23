<script setup lang="ts">
const props = defineProps<{ target: string }>()

const now = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  now.value = Date.now()
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const labels = ['Days', 'Hours', 'Mins', 'Secs']

// Values stay null on the server so the markup matches before hydration.
const values = computed(() => {
  if (now.value === null) return null
  const diff = Math.max(0, new Date(props.target).getTime() - now.value)
  return [
    Math.floor(diff / 86_400_000),
    Math.floor(diff / 3_600_000) % 24,
    Math.floor(diff / 60_000) % 60,
    Math.floor(diff / 1000) % 60,
  ]
})
</script>

<template>
  <div class="flex gap-2 sm:gap-3" role="timer" aria-label="Countdown to the finals">
    <div
      v-for="(label, i) in labels"
      :key="label"
      class="card flex w-16 flex-col items-center py-3 sm:w-20"
    >
      <span class="font-display text-2xl font-bold text-white tabular-nums sm:text-3xl">
        {{ values ? String(values[i]).padStart(2, '0') : '--' }}
      </span>
      <span class="text-[0.65rem] tracking-widest text-fg-muted uppercase">{{ label }}</span>
    </div>
  </div>
</template>
