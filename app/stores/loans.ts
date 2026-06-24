// LOANS STORE (Pinia) — Loan application state + API calls
export interface LoanApplication {
  id:                string
  applicationNo:     string
  status:            string
  loanType:          string
  loanAmount:        number
  borrowerFirstName: string
  borrowerLastName:  string
  borrowerEmail:     string
  loanTerm:          number
  submittedAt:       string
  assignedOfficer?:  { id: string; name: string } | null
}

export interface LoanFilters {
  page?:     number
  limit?:    number
  status?:   string
  loanType?: string
  search?:   string
}

export const useLoansStore = defineStore('loans', () => {
  const applications = ref<LoanApplication[]>([])
  const total        = ref(0)
  const loading      = ref(false)
  const filters      = ref<LoanFilters>({ page: 1, limit: 20 })

  const totalPages = computed(() => Math.ceil(total.value / (filters.value.limit ?? 20)))

  async function fetchLoans(newFilters?: LoanFilters) {
    if (newFilters) filters.value = { ...filters.value, ...newFilters }
    loading.value = true
    try {
      const data = await $fetch<{ data: LoanApplication[]; pagination: { total: number } }>(
        '/api/loans', { query: filters.value },
      )
      applications.value = data.data
      total.value        = data.pagination.total
    }
    finally { loading.value = false }
  }

  async function updateStatus(id: string, status: string) {
    await $fetch(`/api/loans/${id}`, { method: 'PATCH', body: { status } })
    const loan = applications.value.find(a => a.id === id)
    if (loan) loan.status = status
  }

  function setFilter(key: keyof LoanFilters, value: string | number | undefined) {
    filters.value = { ...filters.value, [key]: value, page: 1 }
  }

  return { applications, total, loading, filters, totalPages, fetchLoans, updateStatus, setFilter }
})
