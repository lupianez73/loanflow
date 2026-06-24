// PATCH /api/loans/:id — Update status / assign officer / add details
import { z } from 'zod'

const updateSchema = z.object({
  status:            z.string().optional(),
  assignedOfficerId: z.string().optional(),
  interestRate:      z.number().optional(),
  creditScore:       z.number().int().min(300).max(850).optional(),
  closingDate:       z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id   = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, updateSchema.parse)

  const existing = await prisma.loanApplication.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (body.status && body.status !== existing.status) {
    await prisma.statusHistory.create({
      data: {
        applicationId: id,
        fromStatus:    existing.status,
        toStatus:      body.status,
        changedById:   user.id,
      },
    })
  }

  const updated = await prisma.loanApplication.update({
    where: { id },
    data:  {
      ...body,
      ...(body.status === 'APPROVED' ? { approvedAt: new Date() } : {}),
      ...(body.status === 'DENIED'   ? { deniedAt:   new Date() } : {}),
      ...(body.closingDate ? { closingDate: new Date(body.closingDate) } : {}),
    },
  })

  return { data: updated }
})
