// ═══════════════════════════════════════════════════════════════════════
// ROUTE MIDDLEWARE — Runs on both SSR (initial load) and client navigation
// ═══════════════════════════════════════════════════════════════════════
// Named middleware. Pages opt-in with: definePageMeta({ middleware: 'auth' })
//
// Cookie forwarding:
//   On SSR (page reload), $fetch runs inside Nitro — it has no access to the
//   browser's cookie jar. We must manually forward the incoming request's
//   'cookie' header so /api/auth/me can read the auth_token.
//   On the client (SPA navigation), the browser sends cookies automatically.

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.user) {
    try {
      // On SSR: forward the incoming cookie header so the API can read auth_token.
      // On client: useRequestHeaders returns {} and browser sends cookies natively.
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}
      const data = await $fetch<{ user: typeof authStore.user }>('/api/auth/me', { headers })
      authStore.user = data.user
    } catch {
      authStore.user = null
    }
  }

  if (!authStore.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
