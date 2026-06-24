// POST /api/auth/login — Authenticate a loan officer
// Nitro file convention: login.post.ts → only handles POST requests.
// 🔵 VUE DEV NOTE: Like Express router.post('/auth/login', handler)

import { z } from 'zod'

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse)

  const user = await prisma.user.findUnique({
    where:  { email: body.email },
    select: { id: true, email: true, name: true, role: true, password: true, isActive: true },
  })

  if (!user || !user.isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const ok = await verifyPassword(body.password, user.password)
  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const config = useRuntimeConfig()
  const token  = await signJWT({ userId: user.id, email: user.email, role: user.role }, config.jwtSecret)

  // HTTP-only cookie — JS can't read it, more secure than localStorage
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24,
    path:     '/',
  })

  const { password: _pwd, ...safeUser } = user
  return { user: safeUser }
})
