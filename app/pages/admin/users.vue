<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
useHead({ title: 'User Management' })

const authStore = useAuthStore()

// Redirect non-admins
if (!authStore.isAdmin) {
  await navigateTo('/dashboard')
}

const { data, refresh } = await useFetch('/api/users')
const users = computed(() => (data.value as any)?.data ?? [])

const ROLES = ['ADMIN', 'LOAN_OFFICER', 'PROCESSOR']
const busy  = ref<string | null>(null)
const error = ref('')

async function toggleActive(user: any) {
  busy.value  = user.id
  error.value = ''
  try {
    await $fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      body:   { isActive: !user.isActive },
    })
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? 'Failed'
  } finally {
    busy.value = null
  }
}

async function changeRole(user: any, role: string) {
  busy.value  = user.id
  error.value = ''
  try {
    await $fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      body:   { role },
    })
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? 'Failed'
  } finally {
    busy.value = null
  }
}

function roleColor(role: string) {
  if (role === 'ADMIN')        return 'bg-purple-100 text-purple-700'
  if (role === 'PROCESSOR')    return 'bg-blue-100 text-blue-700'
  return 'bg-slate-100 text-slate-600'
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-6">

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900">User Management</h1>
      <p class="text-slate-500 text-sm mt-1">Manage loan officers, processors, and admins.</p>
    </div>

    <p v-if="error" class="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
      {{ error }}
    </p>

    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50">
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Loans</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            <th class="px-5 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50 transition-colors">

            <!-- Avatar + name -->
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {{ initials(user.name) }}
                </div>
                <div>
                  <p class="font-medium text-slate-900">{{ user.name }}</p>
                  <p class="text-slate-400 text-xs">{{ user.email }}</p>
                </div>
              </div>
            </td>

            <!-- Role selector -->
            <td class="px-5 py-4">
              <select
                :value="user.role"
                :disabled="busy === user.id || user.id === authStore.user?.id"
                @change="changeRole(user, ($event.target as HTMLSelectElement).value)"
                :class="['text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed', roleColor(user.role)]"
              >
                <option v-for="r in ROLES" :key="r" :value="r">{{ r.replace('_', ' ') }}</option>
              </select>
            </td>

            <!-- Loan count -->
            <td class="px-5 py-4 text-slate-600">
              {{ user._count?.applications ?? 0 }}
            </td>

            <!-- Active badge -->
            <td class="px-5 py-4">
              <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600']">
                <span :class="['w-1.5 h-1.5 rounded-full', user.isActive ? 'bg-green-500' : 'bg-red-400']" />
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <!-- Toggle button -->
            <td class="px-5 py-4 text-right">
              <button
                v-if="user.id !== authStore.user?.id"
                :disabled="busy === user.id"
                @click="toggleActive(user)"
                :class="['text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40',
                  user.isActive
                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                    : 'border-green-200 text-green-600 hover:bg-green-50']"
              >
                {{ busy === user.id ? '…' : user.isActive ? 'Deactivate' : 'Activate' }}
              </button>
              <span v-else class="text-xs text-slate-400">You</span>
            </td>

          </tr>
        </tbody>
      </table>

      <div v-if="!users.length" class="py-12 text-center text-slate-400 text-sm">
        No users found.
      </div>
    </div>
  </div>
</template>
