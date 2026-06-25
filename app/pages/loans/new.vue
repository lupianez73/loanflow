<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'New Application' })

const router     = useRouter()
const submitting = ref(false)
const error      = ref('')

const form = reactive({
  loanType:          'CONVENTIONAL',
  loanAmount:        400000,
  loanTerm:          360,
  propertyAddress:   '',
  propertyValue:     500000,
  borrowerFirstName: '',
  borrowerLastName:  '',
  borrowerEmail:     '',
  borrowerPhone:     '',
  borrowerSSN:       '',
  annualIncome:      0,
  employmentStatus:  'EMPLOYED',
})

async function submit() {
  submitting.value = true
  error.value      = ''
  try {
    const data = await $fetch<{ data: { id: string } }>('/api/loans', { method: 'POST', body: form })
    await router.push(`/loans/${data.data.id}`)
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    error.value = e?.data?.statusMessage ?? 'Failed to submit application'
  }
  finally { submitting.value = false }
}

const LOAN_TYPES   = ['CONVENTIONAL', 'FHA', 'VA', 'JUMBO', 'REFINANCE', 'HELOC']
const TERM_OPTIONS = [{ label: '10 years', value: 120 }, { label: '15 years', value: 180 }, { label: '20 years', value: 240 }, { label: '30 years', value: 360 }]
const EMP_OPTIONS  = ['EMPLOYED', 'SELF_EMPLOYED', 'RETIRED', 'UNEMPLOYED']
const ltvRatio     = computed(() => form.propertyValue > 0 ? ((form.loanAmount / form.propertyValue) * 100).toFixed(1) : '0.0')
</script>

<template>
  <div class="p-6 max-w-3xl">
    <div class="mb-6">
      <NuxtLink to="/loans" class="text-sm text-blue-600 hover:underline">← Back to Applications</NuxtLink>
      <h1 class="text-2xl font-bold text-slate-900 mt-2">New Loan Application</h1>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">{{ error }}</div>

    <form @submit.prevent="submit" class="space-y-6">
      <!-- Loan info -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 class="font-semibold text-slate-900">Loan Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Loan Type</label>
            <select v-model="form.loanType" class="input">
              <option v-for="t in LOAN_TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="label">Loan Term</label>
            <select v-model.number="form.loanTerm" class="input">
              <option v-for="t in TERM_OPTIONS" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div>
            <label class="label">Loan Amount ($)</label>
            <input v-model.number="form.loanAmount" type="number" min="10000" class="input" required />
          </div>
          <div>
            <label class="label">Property Value ($)</label>
            <input v-model.number="form.propertyValue" type="number" min="10000" class="input" />
            <p class="text-xs text-slate-400 mt-1">LTV: {{ ltvRatio }}%</p>
          </div>
          <div class="col-span-2">
            <label class="label">Property Address</label>
            <input v-model="form.propertyAddress" type="text" class="input" placeholder="123 Main St, Atlanta, GA 30301" required />
          </div>
        </div>
      </div>

      <!-- Borrower info -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 class="font-semibold text-slate-900">Borrower Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">First Name</label>
            <input v-model="form.borrowerFirstName" type="text" class="input" required />
          </div>
          <div>
            <label class="label">Last Name</label>
            <input v-model="form.borrowerLastName" type="text" class="input" required />
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="form.borrowerEmail" type="email" class="input" required />
          </div>
          <div>
            <label class="label">Phone</label>
            <input v-model="form.borrowerPhone" type="tel" class="input" placeholder="(555) 555-5555" />
          </div>
          <div>
            <label class="label">SSN (XXX-XX-XXXX)</label>
            <input v-model="form.borrowerSSN" type="text" class="input" placeholder="123-45-6789" />
          </div>
          <div>
            <label class="label">Employment Status</label>
            <select v-model="form.employmentStatus" class="input">
              <option v-for="e in EMP_OPTIONS" :key="e" :value="e">{{ e.replace(/_/g, ' ') }}</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="label">Annual Income ($)</label>
            <input v-model.number="form.annualIncome" type="number" min="0" class="input" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
      >
        {{ submitting ? 'Submitting...' : 'Submit Application' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
.label { @apply block text-sm font-medium text-slate-700 mb-1.5; }
.input  { @apply w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white; }
</style>
