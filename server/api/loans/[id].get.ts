// GET /api/loans/:id — Single loan with full relations
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id   = getRouterParam(event, 'id')!

  const app = await prisma.loanApplication.findUnique({
    where:   { id },
    include: {
      assignedOfficer: { select: { id: true, name: true, email: true } },
      documents:       true,
      notes:           { orderBy: { createdAt: 'desc' } },
      statusHistory:   { orderBy: { changedAt:  'asc'  } },
    },
  })

  if (!app) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  if (user.role === 'LOAN_OFFICER' && app.assignedOfficerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return { data: app }
})
