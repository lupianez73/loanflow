// ═══════════════════════════════════════════════════════════════════════
// AUTH STORE (Pinia) — Same defineStore syntax you already know
// ═══════════════════════════════════════════════════════════════════════
// 🔵 VUE DEV NOTE: Identical to Pinia in your trading platform.
// In NexDash (Next.js): equivalent to Zustand's useAppStore.

export const useAuthStore = defineStore('auth', () => {
  const user    = ref<{ id: string; name: string; email: string; role: string } | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin         = computed(() => user.value?.role === 'ADMIN')
  const isOfficer       = computed(() => user.value?.role === 'LOAN_OFFICER')

  async function login(email: string, password: string) {
    loading.value = true
    try {
      // $fetch = Nuxt's HTTP client. useFetch = for templates (reactive).
      // $fetch = for actions (imperative, like axios).
      const data = await $fetch<{ user: typeof user.value }>('/api/auth/login', {
        method: 'POST',
        body:   { email, password },
      })
      user.value = data.user
      await navigateTo('/dashboard')
    }
    finally {
      loading.value = false
    }
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  async function fetchMe() {
    try {
      const data = await $fetch<{ user: typeof user.value }>('/api/auth/me')
      user.value = data.user
    }
    catch {
      user.value = null
    }
  }

  return { user, loading, isAuthenticated, isAdmin, isOfficer, login, logout, fetchMe }
})
