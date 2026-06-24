// ═══════════════════════════════════════════════════════════════════════
// ROUTE MIDDLEWARE — Client-side navigation guard
// ═══════════════════════════════════════════════════════════════════════
// Named middleware. Pages opt-in with: definePageMeta({ middleware: 'auth' })
// 🔵 VUE DEV NOTE: Like Vue Router's beforeEach, but scoped to pages.
// In Next.js: src/middleware.ts runs on the Edge (server-side).
// This one runs client-side on navigation.

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.user) await authStore.fetchMe()
  if (!authStore.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
