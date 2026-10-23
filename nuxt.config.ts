import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseKey: '',
    },
  },
  // The portal talks to Supabase from the browser only, so skip SSR there.
  routeRules: {
    '/portal/**': { ssr: false },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: "U-mai '26 — University maimai Tournament",
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: "U-mai '26 is a maimai DX tournament for university students in Malaysia. Finals on 12 December 2026 at Sunway Wangsa Walk." },
        { name: 'theme-color', content: '#141119' },
        { property: 'og:title', content: "U-mai '26 — University maimai Tournament" },
        { property: 'og:description', content: 'Finals on 12 December 2026 at Sunway Wangsa Walk.' },
        { property: 'og:image', content: '/img/logo.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/img/logo-alt.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Lexend:wght@300;400;500;600;700&display=swap' },
      ],
    },
  },
})
