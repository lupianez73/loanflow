<script setup lang="ts">
// ═══════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════
// definePageMeta = Nuxt macro to configure this page.
// layout: 'auth' → uses layouts/auth.vue instead of layouts/default.vue
// middleware: [] → no auth guard on the login page itself
// 🔵 VUE DEV NOTE: No equivalent in plain Vue; this is Nuxt-specific.

definePageMeta({ layout: 'auth', middleware: [] })
useHead({ title: 'Sign In' })

const authStore   = useAuthStore()
const route       = useRoute()
const serverError = ref('')

// VeeValidate — you already know this from trading platform
const { handleSubmit, isSubmitting } = useForm({
  validationSchema: {
    email:    'required|email',
    password: 'required|min:8',
  },
})

const { value: email,    errorMessage: emailError    } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')

const onSubmit = handleSubmit(async (values) => {
  serverError.value = ''
  try {
    await authStore.login(values.email, values.password)
    const redirect = route.query.redirect as string
    if (redirect) await navigateTo(redirect)
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    serverError.value = e?.data?.statusMessage ?? 'Invalid credentials'
  }
})
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
    <p class="text-slate-500 text-sm mb-6">Sign in to your LoanFlow account</p>

    <div v-if="serverError" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
      {{ serverError }}
    </div>

    <form @submit="onSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
        <input
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="officer@loanflow.com"
          :class="['w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                   emailError ? 'border-red-300 bg-red-50' : 'border-slate-300']"
        />
        <p v-if="emailError" class="text-red-500 text-xs mt-1">{{ emailError }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          :class="['w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                   passwordError ? 'border-red-300 bg-red-50' : 'border-slate-300']"
        />
        <p v-if="passwordError" class="text-red-500 text-xs mt-1">{{ passwordError }}</p>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
      >
        {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>

    <p class="text-center text-xs text-slate-400 mt-6">
      Demo: <strong>admin@loanflow.com</strong> / <strong>Admin123!</strong>
    </p>
  </div>
</template>
