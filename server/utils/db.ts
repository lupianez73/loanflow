// ═══════════════════════════════════════════════════════════════════════
// PRISMA CLIENT — Nitro server utility (auto-imported by all API routes)
// ═══════════════════════════════════════════════════════════════════════
// Prisma 7 ships a CJS build; Nitro runs ESM.
// createRequire bridges the gap — standard Node.js 20 approach.

import { createRequire } from 'node:module'
import { PrismaLibSql as PrismaLibSQL } from '@prisma/adapter-libsql'
import path from 'node:path'

const require = createRequire(import.meta.url)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { PrismaClient } = require('@prisma/client') as any

declare global {
  // eslint-disable-next-line no-var
  var __prisma: unknown
}

function createPrismaClient() {
  const dbUrl   = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), 'prisma/dev.db')}`
  const adapter = new PrismaLibSQL({ url: dbUrl })
  return new PrismaClient({ adapter }) as typeof import('@prisma/client').PrismaClient.prototype
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = (globalThis.__prisma ?? createPrismaClient()) as any
if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma

export { prisma }
