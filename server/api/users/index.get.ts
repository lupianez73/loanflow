// GET /api/users — List all users (admin only)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const users = await prisma.user.findMany({
    select: {
      id:        true,
      name:      true,
      email:     true,
      role:      true,
      isActive:  true,
      createdAt: true,
      _count:    { select: { applications: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return { data: users }
})
