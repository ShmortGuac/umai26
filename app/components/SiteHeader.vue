<script setup lang="ts">
const { links } = useAppConfig()
const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })

const nav = [
  { to: '/', label: 'Home' },
  { to: '/rules', label: 'Rules' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/donate', label: 'Donate' },
  { to: '/portal', label: 'Player Portal' },
]
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-white/5 bg-ink-900/75 backdrop-blur-md">
    <div class="container-x flex h-16 items-center justify-between gap-4">
      <NuxtLink to="/" class="flex shrink-0 items-center" aria-label="U-mai '26 home">
        <img src="/img/logo.png" alt="U-mai '26" class="h-10 w-auto">
      </NuxtLink>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Main">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="rounded-full px-4 py-2 text-sm font-medium text-fg-muted transition hover:text-white"
          active-class="!text-white bg-white/5"
          :exact-active-class="item.to === '/' ? '!text-white bg-white/5' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="hidden md:block">
        <a :href="links.registration" target="_blank" rel="noopener" class="btn-primary !px-4 !py-2 text-sm">Register</a>
      </div>

      <button
        class="rounded-lg p-2 text-fg md:hidden"
        :aria-expanded="open"
        aria-controls="mobile-nav"
        aria-label="Toggle menu"
        @click="open = !open"
      >
        <svg v-if="!open" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
        <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>

    <nav v-if="open" id="mobile-nav" class="border-t border-white/5 md:hidden" aria-label="Mobile">
      <div class="container-x flex flex-col gap-1 py-3">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="rounded-xl px-4 py-3 font-medium text-fg-muted hover:bg-white/5 hover:text-white"
        >
          {{ item.label }}
        </NuxtLink>
        <a :href="links.registration" target="_blank" rel="noopener" class="btn-primary mt-2">Register</a>
      </div>
    </nav>
  </header>
</template>
