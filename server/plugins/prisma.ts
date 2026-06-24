// ═══════════════════════════════════════════════════════════════════════
// NITRO PLUGIN — Runs once when the server boots
// ═══════════════════════════════════════════════════════════════════════
// 🔵 VUE DEV NOTE: Like a Nuxt client plugin but for the server engine.

export default defineNitroPlugin(async () => {
  console.log('[LoanFlow] Connecting to database...')
  try {
    await prisma.$connect()
    console.log('[LoanFlow] Database connected ✓')

    // Seed a demo admin in development if DB is empty
    if (process.env.NODE_ENV === 'development') {
      const count = await prisma.user.count()
      if (count === 0) {
        const { hashPassword } = await import('../utils/auth')
        await prisma.user.create({
          data: {
            email:    'admin@loanflow.com',
            name:     'Admin User',
            password: await hashPassword('Admin123!'),
            role:     'ADMIN',
          },
        })
        console.log('[LoanFlow] Seeded demo admin: admin@loanflow.com / Admin123!')
      }
    }
  }
  catch (err) {
    console.error('[LoanFlow] Database connection failed:', err)
  }

  process.on('beforeExit', () => prisma.$disconnect())
})
