<script setup lang="ts">
// ═══════════════════════════════════════════════════════════════════════
// RATE CALCULATOR — Pure Vue 3 composable demo
// ═══════════════════════════════════════════════════════════════════════
// This page IS standard Vue 3 — identical to what you write in your
// trading platform. No Nuxt-specific concepts needed here.
// The composable handles all the mortgage math.

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Rate Calculator' })

const {
  principal, annualRate, termYears, downPayment,
  loanAmount, monthlyPayment, totalInterest, ltv, pmi, amortization, fmt,
} = useLoanCalculator()
</script>

<template>
  <div class="p-6 max-w-4xl">
    <h1 class="text-2xl font-bold text-slate-900 mb-6">Mortgage Rate Calculator</h1>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Inputs -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 class="font-semibold text-slate-900 border-b pb-3">Loan Details</h2>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            Home Price: <strong>{{ fmt(principal) }}</strong>
          </label>
          <input v-model.number="principal" type="range" min="50000" max="3000000" step="10000" class="w-full accent-blue-600" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            Down Payment: <strong>{{ fmt(downPayment) }}</strong>
            <span class="text-slate-400 text-xs ml-1">({{ ((downPayment / principal) * 100).toFixed(1) }}%)</span>
          </label>
          <input v-model.number="downPayment" type="range" :min="principal * 0.03" :max="principal * 0.5" :step="5000" class="w-full accent-blue-600" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            Interest Rate: <strong>{{ annualRate }}%</strong>
          </label>
          <input v-model.number="annualRate" type="range" min="3" max="12" step="0.125" class="w-full accent-blue-600" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Loan Term</label>
          <div class="flex gap-2">
            <button
              v-for="y in [10, 15, 20, 25, 30]"
              :key="y"
              type="button"
              @click="termYears = y"
              :class="['flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                       termYears === y ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-700 hover:border-blue-300']"
            >{{ y }}yr</button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="space-y-4">
        <div class="bg-blue-700 text-white rounded-xl p-6">
          <p class="text-blue-200 text-sm">Monthly Payment</p>
          <p class="text-4xl font-bold mt-1">{{ fmt(monthlyPayment) }}</p>
          <p v-if="pmi > 0" class="text-blue-300 text-xs mt-1">+ {{ fmt(pmi) }}/mo PMI (LTV {{ ltv.toFixed(1) }}% > 80%)</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-2 gap-4">
          <div>
            <p class="text-slate-500 text-xs">Loan Amount</p>
            <p class="font-bold text-slate-900">{{ fmt(loanAmount) }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs">Total Interest</p>
            <p class="font-bold text-red-600">{{ fmt(totalInterest) }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs">LTV Ratio</p>
            <p :class="['font-bold', ltv > 80 ? 'text-red-600' : 'text-green-600']">{{ ltv.toFixed(1) }}%</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs">Term</p>
            <p class="font-bold text-slate-900">{{ termYears * 12 }} payments</p>
          </div>
        </div>

        <!-- Amortization snapshot -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-3 text-sm">Remaining Balance by Year</h3>
          <div class="space-y-2">
            <div
              v-for="row in amortization.filter((r) => [5, 10, 15, 20, termYears].includes(r.year))"
              :key="row.year"
              class="flex justify-between text-xs"
            >
              <span class="text-slate-500">Year {{ row.year }}</span>
              <span class="font-medium text-slate-900">{{ fmt(row.balance) }} remaining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
