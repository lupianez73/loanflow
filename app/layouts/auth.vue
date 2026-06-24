<template>
  <!-- Auth layout — clean centered card, no sidebar -->
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center h-14 w-14 bg-blue-500 rounded-2xl mb-4">
          <span class="text-white font-bold text-2xl">LF</span>
        </div>
        <h1 class="text-2xl font-bold text-white">LoanFlow</h1>
        <p class="text-blue-200 text-sm mt-1">Mortgage Management Platform</p>
      </div>
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
