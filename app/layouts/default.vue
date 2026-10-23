<template>
  <div class="relative flex min-h-screen flex-col overflow-x-clip">
    <BackgroundDecor />
    <SiteHeader />
    <main class="relative z-10 flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
