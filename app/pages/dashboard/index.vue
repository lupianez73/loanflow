<script setup lang="ts">
// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════
// useFetch = Nuxt's SSR-aware data fetching.
// On server: fetches during SSR, sends data in HTML (fast first load).
// On client: uses cached data — no second request needed.
// 🔵 VUE DEV NOTE: Like useAsyncData but simpler.
// Compare to Next.js: like an async Server Component, but reactive.

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Dashboard' })

const { data: stats, refresh, pending } = await useFetch('/api/dashboard/stats', { lazy: false })

// Auto-refresh every 60 seconds for live pipeline feel
onMounted(() => {
  const interval = setInterval(refresh, 60_000)
  onUnmounted(() => clearInterval(interval))
})

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const STATUS_CONFIG = [
  { key: 'pending',         label: 'Pending',       color: 'bg-yellow-100 text-yellow-800' },
  { key: 'inReview',        label: 'In Review',     color: 'bg-blue-100 text-blue-800'     },
  { key: 'underwriting',    label: 'Underwriting',  color: 'bg-purple-100 text-purple-800' },
  { key: 'approved',        label: 'Approved',      color: 'bg-green-100 text-green-800'   },
] as const

function statusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:   'bg-yellow-100 text-yellow-800',
    IN_REVIEW: 'bg-blue-100 text-blue-800',
    APPROVED:  'bg-green-100 text-green-800',
    DENIED:    'bg-red-100 text-red-800',
    CLOSED:    'bg-slate-100 text-slate-700',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Loan Pipeline Dashboard</h1>
      <p class="text-slate-500 text-sm mt-1">
        {{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/New_York' }) }}
      </p>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-if="pending" v-for="i in 4" :key="i" class="h-28 bg-slate-100 rounded-xl animate-pulse" />
      <template v-else>
        <div class="bg-white rounded-xl border border-slate-200 p-5 col-span-2">
          <p class="text-slate-500 text-sm">Total Funded Volume</p>
          <p class="text-3xl font-bold text-slate-900 mt-1">{{ fmt(stats?.totalFundedVolume ?? 0) }}</p>
          <p class="text-xs text-slate-400 mt-1">Approved + Closed</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <p class="text-slate-500 text-sm">Avg Loan</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ fmt(stats?.avgLoanAmount ?? 0) }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <p class="text-slate-500 text-sm">Active Pipeline</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">
            {{ stats?.pipeline ? Object.values(stats.pipeline).reduce((a, b) => (a as number) + (b as number), 0) : 0 }}
          </p>
          <p class="text-xs text-slate-400 mt-1">applications</p>
        </div>
      </template>
    </div>

    <!-- Status breakdown -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="cfg in STATUS_CONFIG" :key="cfg.key" class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p :class="['text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-2', cfg.color]">{{ cfg.label }}</p>
        <p class="text-3xl font-bold text-slate-900">{{ (stats?.pipeline as Record<string, number>)?.[cfg.key] ?? 0 }}</p>
      </div>
    </div>

    <!-- Recent applications -->
    <div class="bg-white rounded-xl border border-slate-200">
      <div class="flex items-center justify-between p-5 border-b border-slate-100">
        <h2 class="font-semibold text-slate-900">Recent Applications</h2>
        <NuxtLink to="/loans" class="text-sm text-blue-600 hover:underline">View all →</NuxtLink>
      </div>
      <div class="divide-y divide-slate-100">
        <div v-for="loan in stats?.recentApplications ?? []" :key="loan.id" class="flex items-center justify-between px-5 py-3">
          <div>
            <p class="font-medium text-slate-900 text-sm">{{ loan.borrowerFirstName }} {{ loan.borrowerLastName }}</p>
            <p class="text-xs text-slate-400">{{ loan.applicationNo }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-slate-900">{{ fmt(loan.loanAmount) }}</p>
            <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', statusColor(loan.status)]">
              {{ loan.status.replace(/_/g, ' ') }}
            </span>
          </div>
        </div>
        <div v-if="!stats?.recentApplications?.length" class="px-5 py-8 text-center text-slate-400 text-sm">
          No applications yet
        </div>
      </div>
    </div>
  </div>
</template>
