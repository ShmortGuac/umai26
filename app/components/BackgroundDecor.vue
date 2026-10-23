<!-- Echoes the poster backdrop: giant faint outline logo, sweeping arcs and a soft glow. -->
<template>
  <div aria-hidden="true" class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <div class="absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-orchid/10 blur-3xl" />
    <div class="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-peri/10 blur-3xl" />
    <img
      src="/img/logo-alt.png"
      alt=""
      class="absolute top-1/2 left-1/2 w-[160vw] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.025] grayscale sm:w-[120vw]"
    >
    <svg class="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 1000 1000" preserveAspectRatio="none">
      <circle cx="500" cy="500" r="620" fill="none" stroke="#e6cded" stroke-width="0.6" />
      <circle cx="500" cy="500" r="440" fill="none" stroke="#e6cded" stroke-width="0.4" stroke-dasharray="2 6" />
      <line x1="-50" y1="80" x2="1050" y2="-40" stroke="#e6cded" stroke-width="0.5" />
      <line x1="-50" y1="1040" x2="1050" y2="880" stroke="#e6cded" stroke-width="0.5" />
    </svg>
  </div>
</template>
