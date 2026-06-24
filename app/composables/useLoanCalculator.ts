// ═══════════════════════════════════════════════════════════════════════
// LOAN CALCULATOR COMPOSABLE
// ═══════════════════════════════════════════════════════════════════════
// Monthly payment formula (standard amortization):
//   M = P * [r(1+r)^n] / [(1+r)^n - 1]
//   P = principal, r = monthly rate, n = total payments

export function useLoanCalculator() {
  const principal   = ref(400_000)
  const annualRate  = ref(6.875)
  const termYears   = ref(30)
  const downPayment = ref(80_000)

  const loanAmount = computed(() => principal.value - downPayment.value)

  const monthlyPayment = computed(() => {
    const P = loanAmount.value
    const r = annualRate.value / 100 / 12
    const n = termYears.value * 12
    if (r === 0) return P / n
    return P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  })

  const totalCost     = computed(() => monthlyPayment.value * termYears.value * 12)
  const totalInterest = computed(() => totalCost.value - loanAmount.value)
  const ltv           = computed(() => (loanAmount.value / principal.value) * 100)
  const pmi           = computed(() => ltv.value > 80 ? loanAmount.value * 0.01 / 12 : 0)

  const amortization = computed(() => {
    const rows: { year: number; balance: number; interest: number; principal: number }[] = []
    let balance = loanAmount.value
    const r     = annualRate.value / 100 / 12
    const pmt   = monthlyPayment.value

    for (let month = 1; month <= termYears.value * 12; month++) {
      const interest  = balance * r
      const principal = pmt - interest
      balance        -= principal
      if (month % 12 === 0) {
        rows.push({ year: month / 12, balance: Math.max(0, balance), interest: interest * 12, principal: principal * 12 })
      }
    }
    return rows
  })

  const fmt = (n: number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n)

  return { principal, annualRate, termYears, downPayment, loanAmount, monthlyPayment, totalCost, totalInterest, ltv, pmi, amortization, fmt }
}
