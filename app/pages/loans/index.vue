<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Loan Applications' })

const loansStore = useLoansStore()
const search     = ref('')
const debounced  = useDebounce(search, 400)

const { data, pending } = await useFetch('/api/loans', {
  query: computed(() => ({
    search:   debounced.value || undefined,
    status:   loansStore.filters.status,
    page:     loansStore.filters.page,
    limit:    loansStore.filters.limit,
  })),
})

const STATUS_OPTIONS = ['PENDING', 'IN_REVIEW', 'DOCUMENTS_NEEDED', 'UNDERWRITING', 'APPROVED', 'DENIED', 'CLOSED']
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Loan Applications</h1>
        <p class="text-slate-500 text-sm">{{ data?.pagination?.total ?? 0 }} total</p>
      </div>
      <NuxtLink to="/loans/new" class="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
        + New Application
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex gap-3 mb-4">
      <input
        v-model="search"
        type="search"
        placeholder="Search by name, email, app #..."
        class="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        :value="loansStore.filters.status"
        @change="loansStore.setFilter('status', ($event.target as HTMLSelectElement).value || undefined)"
        class="px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All statuses</option>
        <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s.replace(/_/g, ' ') }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="pending" class="p-8 text-center text-slate-400">Loading...</div>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Application</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Borrower</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted</th>
            <th />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="loan in data?.data ?? []" :key="loan.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-5 py-3">
              <p class="font-mono text-xs text-blue-700 font-semibold">{{ loan.applicationNo }}</p>
              <p class="text-xs text-slate-400">{{ loan.loanType }}</p>
            </td>
            <td class="px-5 py-3">
              <p class="font-medium text-slate-900">{{ loan.borrowerFirstName }} {{ loan.borrowerLastName }}</p>
              <p class="text-xs text-slate-400">{{ loan.borrowerEmail }}</p>
            </td>
            <td class="px-5 py-3 font-semibold text-slate-900">{{ fmt(loan.loanAmount) }}</td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                {{ loan.status.replace(/_/g, ' ') }}
              </span>
            </td>
            <td class="px-5 py-3 text-slate-400 text-xs">{{ new Date(loan.submittedAt).toLocaleDateString() }}</td>
            <td class="px-5 py-3">
              <NuxtLink :to="`/loans/${loan.id}`" class="text-blue-600 hover:underline text-xs">View →</NuxtLink>
            </td>
          </tr>
          <tr v-if="!data?.data?.length">
            <td colspan="6" class="px-5 py-12 text-center text-slate-400">No applications found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
