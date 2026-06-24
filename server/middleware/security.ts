// ═══════════════════════════════════════════════════════════════════════
// SERVER MIDDLEWARE — Security headers on every response
// ═══════════════════════════════════════════════════════════════════════
// Runs before every API request. Like Express app.use(middleware).
// 🔵 VUE DEV NOTE: Different from route middleware (app/middleware/).
// server/middleware/ = server-side, all requests.
// app/middleware/    = client-side, before navigation.

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options':        'DENY',
    'X-XSS-Protection':       '1; mode=block',
    'Referrer-Policy':        'strict-origin-when-cross-origin',
  })
})
