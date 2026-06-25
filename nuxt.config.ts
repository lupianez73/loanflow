// ═══════════════════════════════════════════════════════════════════════
// NUXT CONFIG — Central configuration for the entire application
// ═══════════════════════════════════════════════════════════════════════
// Nuxt 3 = Vue 3 + file-based routing + Nitro server engine + auto-imports.
// Everything lives here: modules, CSS, runtime vars, SSR settings.
//
// 🔵 VUE DEV NOTE: Like vite.config.ts + main.ts + vue-router config combined.
// In Next.js: equivalent to next.config.js

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // ── Nuxt 4 compatibility flags ───────────────────────────────────────
  future: { compatibilityVersion: 4 },
  compatibilityDate: '2024-11-01',

  // ── Modules ─────────────────────────────────────────────────────────
  // Modules auto-configure themselves — no manual app.use() like plain Vue.
  modules: [
    '@pinia/nuxt',  // State management (defineStore)
  ],

  // ── CSS ─────────────────────────────────────────────────────────────
  css: ['~/assets/css/main.css'],

  // ── Vite plugins ─────────────────────────────────────────────────────
  vite: {
    plugins: [tailwindcss()],
  },

  // ── Auto-imports ─────────────────────────────────────────────────────
  // Nuxt auto-imports Vue APIs (ref, computed, watch) and Nuxt composables
  // (useFetch, useRoute, navigateTo). You DON'T need to import them.
  // 🔵 VUE DEV NOTE: No import statements needed for these — just use them.
  imports: {
    dirs: ['stores', 'composables'],
  },

  // ── Runtime config ───────────────────────────────────────────────────
  // runtimeConfig.public = available in both server and browser
  // runtimeConfig (root) = SERVER ONLY — secrets never reach the browser
  runtimeConfig: {
    jwtSecret:   process.env.JWT_SECRET   || 'dev-secret-change-in-production-min-32-chars',
    databaseUrl: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    public: {
      appName:    'LoanFlow',
      appVersion: '1.0.0',
    },
  },

  // ── Nitro (server engine) ────────────────────────────────────────────
  // 'vercel' preset auto-detected when VERCEL env var is present.
  // Explicitly set here so local `nuxt build` also produces a Vercel-ready
  // output when needed. Nitro wraps API routes as Vercel serverless functions.
  nitro: {
    preset: process.env.VERCEL ? 'vercel' : undefined,
  },

  // ── Dev server ───────────────────────────────────────────────────────
  devServer: { port: 4000 },

  // ── SSR ──────────────────────────────────────────────────────────────
  ssr: true,

  // ── Dev tools ────────────────────────────────────────────────────────
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
})
