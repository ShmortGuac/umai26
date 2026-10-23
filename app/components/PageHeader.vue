<script setup lang="ts">
defineProps<{ eyebrow: string, title: string }>()
</script>

<template>
  <header class="max-w-3xl">
    <p class="eyebrow">{{ eyebrow }}</p>
    <h1 class="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">{{ title }}</h1>
    <p v-if="$slots.default" class="mt-4 text-lg leading-relaxed text-fg-muted">
      <slot />
    </p>
    <div v-if="$slots.actions" class="mt-6 flex flex-wrap gap-3">
      <slot name="actions" />
    </div>
  </header>
</template>
