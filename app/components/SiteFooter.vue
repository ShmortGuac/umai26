<script setup lang="ts">
const { links, event } = useAppConfig()
</script>

<template>
  <footer class="relative z-10 mt-24 border-t border-white/5 bg-ink-950/60">
    <div class="container-x grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
      <div>
        <img src="/img/logo-alt.png" alt="U-mai '26" class="h-14 w-auto">
        <p class="mt-4 max-w-sm text-sm text-fg-muted">
          {{ event.tagline }} — a maimai DX tournament by students, for students.
          Finals at {{ event.venue }} on 12 December 2026.
        </p>
        <div class="mt-6">
          <p class="text-xs tracking-widest text-fg-muted uppercase">Organised by</p>
          <div class="mt-3 flex items-center gap-4">
            <img src="/img/rgc.png" alt="IIUM Rhythm Game Club" class="h-14 w-auto">
            <span class="h-10 w-px bg-fg/20" aria-hidden="true" />
            <img src="/img/iiumai-text.png" alt="iiumai" class="h-10 w-auto">
          </div>
          <p class="mt-2 text-xs text-fg-muted">IIUM Rhythm Game Club · iiumai (maimai division)</p>
        </div>
      </div>
      <div>
        <h3 class="font-display font-semibold text-white">Tournament</h3>
        <ul class="mt-3 space-y-2 text-sm text-fg-muted">
          <li><NuxtLink to="/rules" class="hover:text-white">Rulebook</NuxtLink></li>
          <li><NuxtLink to="/schedule" class="hover:text-white">Schedule &amp; Venue</NuxtLink></li>
          <li><NuxtLink to="/donate" class="hover:text-white">Donate</NuxtLink></li>
          <li><NuxtLink to="/portal" class="hover:text-white">Player Portal</NuxtLink></li>
        </ul>
      </div>
      <div>
        <h3 class="font-display font-semibold text-white">Community</h3>
        <ul class="mt-3 space-y-2 text-sm text-fg-muted">
          <li><a :href="links.discord" target="_blank" rel="noopener" class="hover:text-white">Discord</a></li>
          <li><a :href="links.instagram" target="_blank" rel="noopener" class="hover:text-white">Instagram</a></li>
          <li><a :href="links.tiktok" target="_blank" rel="noopener" class="hover:text-white">TikTok</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/5 py-5 text-center text-xs text-fg-muted/70">
      U-mai '26 is a fan-organised community event and is not affiliated with SEGA.
    </div>
  </footer>
</template>
