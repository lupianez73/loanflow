// POST /api/auth/logout — Clear the session cookie
export default defineEventHandler(async (event) => {
  deleteCookie(event, 'auth_token', { path: '/' })
  return { ok: true }
})
