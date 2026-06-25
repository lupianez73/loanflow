// Run: npm run db:seed
// Creates the demo admin user in the database (local or Turso)
import { createRequire } from 'node:module'
import { PrismaLibSql as PrismaLibSQL } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client')

const dbUrl  = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), 'prisma/dev.db')}`
const adapter = new PrismaLibSQL({ url: dbUrl })
const prisma  = new PrismaClient({ adapter })

async function main() {
  const hash = await bcrypt.hash('Admin123!', 12)

  const admin = await prisma.user.upsert({
    where:  { email: 'admin@loanflow.com' },
    update: {},
    create: {
      email:    'admin@loanflow.com',
      name:     'Admin User',
      password: hash,
      role:     'ADMIN',
      isActive: true,
    },
  })

  console.log('✅ Admin user ready:', admin.email)
  console.log('   Password: Admin123!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
