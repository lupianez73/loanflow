<script setup lang="ts">
// ═══════════════════════════════════════════════════════════════════════
// DEFAULT LAYOUT — Authenticated dashboard shell with sidebar
// ═══════════════════════════════════════════════════════════════════════
// Pages that use: definePageMeta({ middleware: 'auth' }) get this layout.
// <slot /> renders the page content inside the layout.
// 🔵 VUE DEV NOTE: Like a wrapper component with <slot />,
//   but applied automatically via Nuxt's layout system.

const authStore = useAuthStore()
const sidebar   = ref(true)
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden font-sans">
    <!-- ── SIDEBAR ──────────────────────────────────────────────────── -->
    <aside :class="['bg-slate-900 flex flex-col shrink-0 transition-all duration-300', sidebar ? 'w-64' : 'w-16']">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 h-16 border-b border-slate-700">
        <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <span class="text-white font-bold text-sm">LF</span>
        </div>
        <span v-if="sidebar" class="text-white font-bold text-lg">LoanFlow</span>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 p-3 space-y-1 mt-2">
        <AppNavLink href="/dashboard"  icon="📊" :label="sidebar ? 'Dashboard'       : ''" />
        <AppNavLink href="/loans"      icon="📋" :label="sidebar ? 'Applications'    : ''" />
        <AppNavLink href="/loans/new"  icon="➕" :label="sidebar ? 'New Application' : ''" />
        <AppNavLink href="/calculator" icon="🧮" :label="sidebar ? 'Rate Calculator' : ''" />
        <template v-if="authStore.isAdmin">
          <div v-if="sidebar" class="text-slate-500 text-xs font-semibold uppercase px-3 pt-4 pb-1">Admin</div>
          <AppNavLink href="/admin/users" icon="👥" :label="sidebar ? 'Users' : ''" />
        </template>
      </nav>

      <!-- User footer -->
      <div class="p-3 border-t border-slate-700">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {{ authStore.user?.name?.charAt(0) ?? '?' }}
          </div>
          <div v-if="sidebar" class="min-w-0">
            <p class="text-white text-sm font-medium truncate">{{ authStore.user?.name }}</p>
            <p class="text-slate-400 text-xs truncate">{{ authStore.user?.role?.replace(/_/g, ' ') }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- ── MAIN AREA ────────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Topbar -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <button @click="sidebar = !sidebar" class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          ☰
        </button>
        <div class="flex items-center gap-4">
          <span class="text-xs text-slate-400 hidden sm:block">
            {{ new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }) }} ET
          </span>
          <button @click="authStore.logout" class="text-sm text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
