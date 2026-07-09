<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: [] })
useHead({ title: 'Sign In' })

const authStore   = useAuthStore()
const route       = useRoute()
const email       = ref('')
const password    = ref('')
const errors      = reactive({ email: '', password: '' })
const serverError = ref('')
const submitting  = ref(false)

function validate() {
  errors.email    = ''
  errors.password = ''
  let ok = true
  if (!email.value)                            { errors.email    = 'Email is required';          ok = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { errors.email = 'Enter a valid email'; ok = false }
  if (!password.value)                         { errors.password = 'Password is required';       ok = false }
  else if (password.value.length < 8)          { errors.password = 'Minimum 8 characters';       ok = false }
  return ok
}

async function onSubmit() {
  if (!validate()) return
  submitting.value  = true
  serverError.value = ''
  try {
    await authStore.login(email.value, password.value)
    const redirect = route.query.redirect as string
    if (redirect) await navigateTo(redirect)
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    serverError.value = e?.data?.statusMessage ?? 'Invalid credentials'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
    <p class="text-slate-500 text-sm mb-6">Sign in to your LoanFlow account</p>

    <div v-if="serverError" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
      {{ serverError }}
    </div>

    <form @submit.prevent="onSubmit" class="space-y-4" novalidate>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
        <input
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="officer@loanflow.com"
          :class="['w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                   errors.email ? 'border-red-300 bg-red-50' : 'border-slate-300']"
        />
        <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          :class="['w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                   errors.password ? 'border-red-300 bg-red-50' : 'border-slate-300']"
        />
        <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors"
      >
        {{ submitting ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>

    <p class="text-center text-xs text-slate-400 mt-6">
      Demo: <strong>admin@loanflow.com</strong> / <strong>Admin123!</strong>
    </p>
  </div>
</template>
