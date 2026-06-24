<script setup lang="ts">
// ═══════════════════════════════════════════════════════════════════════
// APP ROOT — Entry point of the Nuxt application
// ═══════════════════════════════════════════════════════════════════════
// <NuxtLayout> renders the current layout (layouts/default.vue or layouts/auth.vue)
// <NuxtPage> renders the current page (pages/dashboard/index.vue etc.)
// 🔵 VUE DEV NOTE: <RouterView> is replaced by <NuxtPage>.
//   app.vue + NuxtLayout = App.vue + layout slots in Vue Router.

useHead({
  titleTemplate: '%s — LoanFlow',
  meta: [
    { name: 'description', content: 'Mortgage loan management platform' },
    { name: 'theme-color', content: '#1e40af' },
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
