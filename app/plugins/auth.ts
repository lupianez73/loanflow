// ═══════════════════════════════════════════════════════════════════════
// NUXT PLUGIN — Restore session when the app boots
// ═══════════════════════════════════════════════════════════════════════
// Plugins in app/plugins/ run once when the app initializes.
// Filename: auth.ts = runs on both server and client.
//           auth.client.ts = client only  |  auth.server.ts = server only
// 🔵 VUE DEV NOTE: Like app.use() or a global router.beforeEach in main.ts.

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  if (!authStore.user) {
    await authStore.fetchMe().catch(() => {})
  }
})
