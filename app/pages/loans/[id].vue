<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const route  = useRoute()
const id     = route.params.id as string

const { data, error, refresh } = await useFetch(`/api/loans/${id}`)
const loan = computed(() => (data.value as any)?.data)

const borrowerName = computed(() =>
  loan.value ? `${loan.value.borrowerFirstName} ${loan.value.borrowerLastName}` : ''
)
useHead({ title: computed(() => loan.value?.applicationNo ?? 'Loan Detail') })

// ── Status update ─────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'SUBMITTED',      label: 'Submitted',       color: 'bg-slate-100 text-slate-700' },
  { value: 'UNDER_REVIEW',   label: 'Under Review',    color: 'bg-blue-100 text-blue-700' },
  { value: 'APPROVED',       label: 'Approved',        color: 'bg-green-100 text-green-700' },
  { value: 'CONDITIONALLY_APPROVED', label: 'Cond. Approved', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'DENIED',         label: 'Denied',          color: 'bg-red-100 text-red-700' },
  { value: 'WITHDRAWN',      label: 'Withdrawn',       color: 'bg-gray-100 text-gray-500' },
  { value: 'CLOSED',         label: 'Closed',          color: 'bg-emerald-100 text-emerald-700' },
]

const statusColor = computed(() =>
  STATUS_OPTIONS.find(s => s.value === loan.value?.status)?.color ?? 'bg-slate-100 text-slate-700'
)
const statusLabel = computed(() =>
  STATUS_OPTIONS.find(s => s.value === loan.value?.status)?.label ?? loan.value?.status
)

const updatingStatus = ref(false)
const statusError    = ref('')

async function updateStatus(newStatus: string) {
  if (newStatus === loan.value?.status) return
  updatingStatus.value = true
  statusError.value    = ''
  try {
    await $fetch(`/api/loans/${id}`, { method: 'PATCH', body: { status: newStatus } })
    await refresh()
  } catch (e: any) {
    statusError.value = e?.data?.statusMessage ?? 'Failed to update status'
  } finally {
    updatingStatus.value = false
  }
}

// ── Note form ─────────────────────────────────────────────────────────
const noteContent   = ref('')
const addingNote    = ref(false)
const noteError     = ref('')

async function addNote() {
  if (!noteContent.value.trim()) return
  addingNote.value = true
  noteError.value  = ''
  try {
    await $fetch(`/api/loans/${id}/notes`, {
      method: 'POST',
      body: { content: noteContent.value.trim() },
    })
    noteContent.value = ''
    await refresh()
  } catch (e: any) {
    noteError.value = e?.data?.statusMessage ?? 'Failed to add note'
  } finally {
    addingNote.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────
function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-6 space-y-6">

    <!-- Error state -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
      {{ error?.data?.statusMessage ?? 'Could not load loan application.' }}
      <NuxtLink to="/loans" class="ml-2 underline">Back to loans</NuxtLink>
    </div>

    <template v-else-if="loan">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div class="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <NuxtLink to="/loans" class="hover:text-blue-600 transition-colors">Loans</NuxtLink>
            <span>/</span>
            <span class="text-slate-700 font-medium">{{ loan.applicationNo }}</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">{{ borrowerName }}</h1>
          <p class="text-slate-500 text-sm mt-0.5">{{ loan.borrowerEmail }}</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Status badge + changer -->
          <div class="relative">
            <select
              :value="loan.status"
              :disabled="updatingStatus"
              @change="updateStatus(($event.target as HTMLSelectElement).value)"
              :class="['pl-3 pr-8 py-1.5 rounded-full text-sm font-medium border-0 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500', statusColor]"
            >
              <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs">▾</span>
          </div>

          <NuxtLink
            to="/loans"
            class="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ← Back
          </NuxtLink>
        </div>
      </div>

      <p v-if="statusError" class="text-sm text-red-600">{{ statusError }}</p>

      <!-- Main grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Left column: loan details -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Loan details card -->
          <div class="bg-white border border-slate-200 rounded-xl p-5">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Loan Details</h2>
            <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt class="text-slate-500">Loan Amount</dt>
                <dd class="font-semibold text-slate-900 text-lg">{{ formatCurrency(loan.loanAmount) }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">Loan Type</dt>
                <dd class="font-medium text-slate-900">{{ loan.loanType }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">Property Value</dt>
                <dd class="font-medium text-slate-900">{{ formatCurrency(loan.propertyValue) }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">LTV Ratio</dt>
                <dd class="font-medium text-slate-900">
                  {{ ((loan.loanAmount / loan.propertyValue) * 100).toFixed(1) }}%
                </dd>
              </div>
              <div>
                <dt class="text-slate-500">Interest Rate</dt>
                <dd class="font-medium text-slate-900">{{ loan.interestRate ? loan.interestRate + '%' : '—' }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">Credit Score</dt>
                <dd class="font-medium" :class="loan.creditScore >= 720 ? 'text-green-600' : loan.creditScore >= 640 ? 'text-yellow-600' : 'text-red-600'">
                  {{ loan.creditScore ?? '—' }}
                </dd>
              </div>
              <div>
                <dt class="text-slate-500">Submitted</dt>
                <dd class="font-medium text-slate-900">{{ formatDate(loan.submittedAt) }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">Closing Date</dt>
                <dd class="font-medium text-slate-900">{{ formatDate(loan.closingDate) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Property details -->
          <div class="bg-white border border-slate-200 rounded-xl p-5">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Property</h2>
            <dl class="grid grid-cols-1 gap-y-3 text-sm">
              <div>
                <dt class="text-slate-500">Address</dt>
                <dd class="font-medium text-slate-900">{{ loan.propertyAddress }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">Estimated Value</dt>
                <dd class="font-medium text-slate-900">{{ formatCurrency(loan.propertyValue) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Status timeline -->
          <div class="bg-white border border-slate-200 rounded-xl p-5">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Status History</h2>
            <div v-if="loan.statusHistory?.length" class="relative">
              <div class="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
              <ul class="space-y-4">
                <li
                  v-for="(entry, i) in loan.statusHistory"
                  :key="entry.id"
                  class="relative pl-8 text-sm"
                >
                  <span class="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {{ i + 1 }}
                  </span>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span v-if="entry.fromStatus" class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                      {{ entry.fromStatus }}
                    </span>
                    <span v-if="entry.fromStatus" class="text-slate-400">→</span>
                    <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                      {{ entry.toStatus }}
                    </span>
                  </div>
                  <p class="text-slate-400 text-xs mt-0.5">{{ formatDateTime(entry.changedAt) }}</p>
                </li>
              </ul>
            </div>
            <p v-else class="text-slate-400 text-sm">No status changes yet.</p>
          </div>

          <!-- Notes -->
          <div class="bg-white border border-slate-200 rounded-xl p-5">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Internal Notes</h2>

            <!-- Add note form -->
            <form @submit.prevent="addNote" class="mb-4">
              <textarea
                v-model="noteContent"
                rows="3"
                placeholder="Add an internal note..."
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div class="flex items-center justify-between mt-2">
                <p v-if="noteError" class="text-xs text-red-600">{{ noteError }}</p>
                <span v-else />
                <button
                  type="submit"
                  :disabled="addingNote || !noteContent.trim()"
                  class="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
                >
                  {{ addingNote ? 'Adding…' : 'Add Note' }}
                </button>
              </div>
            </form>

            <!-- Notes list -->
            <ul v-if="loan.notes?.length" class="space-y-3">
              <li
                v-for="note in loan.notes"
                :key="note.id"
                class="text-sm bg-slate-50 rounded-lg p-3"
              >
                <p class="text-slate-800 whitespace-pre-wrap">{{ note.content }}</p>
                <p class="text-slate-400 text-xs mt-1.5">{{ formatDateTime(note.createdAt) }}</p>
              </li>
            </ul>
            <p v-else class="text-slate-400 text-sm">No notes yet.</p>
          </div>
        </div>

        <!-- Right column: borrower + officer -->
        <div class="space-y-6">

          <!-- Borrower info -->
          <div class="bg-white border border-slate-200 rounded-xl p-5">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Borrower</h2>
            <dl class="space-y-3 text-sm">
              <div>
                <dt class="text-slate-500">Name</dt>
                <dd class="font-medium text-slate-900">{{ borrowerName }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">Email</dt>
                <dd class="font-medium text-slate-900 break-all">{{ loan.borrowerEmail }}</dd>
              </div>
              <div v-if="loan.borrowerPhone">
                <dt class="text-slate-500">Phone</dt>
                <dd class="font-medium text-slate-900">{{ loan.borrowerPhone }}</dd>
              </div>
              <div v-if="loan.annualIncome">
                <dt class="text-slate-500">Annual Income</dt>
                <dd class="font-medium text-slate-900">{{ formatCurrency(loan.annualIncome) }}</dd>
              </div>
              <div v-if="loan.employmentStatus">
                <dt class="text-slate-500">Employment</dt>
                <dd class="font-medium text-slate-900 capitalize">{{ loan.employmentStatus.replace('_', ' ') }}</dd>
              </div>
            </dl>
          </div>

          <!-- Assigned officer -->
          <div class="bg-white border border-slate-200 rounded-xl p-5">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Loan Officer</h2>
            <div v-if="loan.assignedOfficer" class="text-sm">
              <p class="font-medium text-slate-900">{{ loan.assignedOfficer.name }}</p>
              <p class="text-slate-500 text-xs mt-0.5">{{ loan.assignedOfficer.email }}</p>
            </div>
            <p v-else class="text-slate-400 text-sm">Unassigned</p>
          </div>

          <!-- Quick actions -->
          <div class="bg-white border border-slate-200 rounded-xl p-5">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Quick Actions</h2>
            <div class="space-y-2">
              <button
                @click="updateStatus('APPROVED')"
                :disabled="loan.status === 'APPROVED' || updatingStatus"
                class="w-full py-2 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-lg disabled:opacity-40 transition-colors font-medium"
              >
                ✓ Approve Loan
              </button>
              <button
                @click="updateStatus('DENIED')"
                :disabled="loan.status === 'DENIED' || updatingStatus"
                class="w-full py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-lg disabled:opacity-40 transition-colors font-medium"
              >
                ✕ Deny Loan
              </button>
              <button
                @click="updateStatus('UNDER_REVIEW')"
                :disabled="loan.status === 'UNDER_REVIEW' || updatingStatus"
                class="w-full py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg disabled:opacity-40 transition-colors font-medium"
              >
                ◎ Move to Review
              </button>
            </div>
          </div>
        </div>

      </div>
    </template>

  </div>
</template>
