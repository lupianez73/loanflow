// ═══════════════════════════════════════════════════════════════════════
// AUTH UTILITIES — JWT + password hashing
// ═══════════════════════════════════════════════════════════════════════
// Manual JWT using Web Crypto API (Node 20+ built-in, no library needed).
// In production use nuxt-auth-utils or @sidebase/nuxt-auth for full OAuth.

import { H3Event } from 'h3'
import bcrypt from 'bcryptjs'

function base64url(data: ArrayBuffer): string {
  return Buffer.from(data).toString('base64url')
}

function base64urlDecode(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, 'base64url'))
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function signJWT(
  payload: Record<string, unknown>,
  secret: string,
  expiresInHours = 24,
): Promise<string> {
  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const exp    = Math.floor(Date.now() / 1000) + expiresInHours * 3600
  const body   = base64url(new TextEncoder().encode(JSON.stringify({ ...payload, exp })))
  const key    = await getKey(secret)
  const sig    = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${body}`))
  return `${header}.${body}.${base64url(sig)}`
}

export async function verifyJWT<T = Record<string, unknown>>(
  token: string,
  secret: string,
): Promise<T | null> {
  try {
    const [header, body, signature] = token.split('.')
    if (!header || !body || !signature) return null
    const key = await getKey(secret)
    const valid = await crypto.subtle.verify(
      'HMAC', key,
      base64urlDecode(signature),
      new TextEncoder().encode(`${header}.${body}`),
    )
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(body)))
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload as T
  }
  catch {
    return null
  }
}

export const hashPassword   = (pwd: string)               => bcrypt.hash(pwd, 12)
export const verifyPassword = (pwd: string, hash: string) => bcrypt.compare(pwd, hash)

export async function getCurrentUser(event: H3Event) {
  const config  = useRuntimeConfig()
  const token   = getCookie(event, 'auth_token')
  if (!token) return null
  const payload = await verifyJWT<{ userId: string; email: string; role: string }>(token, config.jwtSecret)
  if (!payload) return null
  return prisma.user.findUnique({
    where:  { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  })
}

export async function requireAuth(event: H3Event) {
  const user = await getCurrentUser(event)
  if (!user || !user.isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return user
}

export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)
  if (user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden — Admin required' })
  }
  return user
}
