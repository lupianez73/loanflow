// PATCH /api/users/:id — Toggle active status or update role (admin only)
import { z } from 'zod'

const schema = z.object({
  isActive: z.boolean().optional(),
  role:     z.enum(['ADMIN', 'LOAN_OFFICER', 'PROCESSOR']).optional(),
})

export default defineEventHandler(async (event) => {
  const me   = await requireAdmin(event)
  const id   = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, schema.parse)

  if (id === me.id) throw createError({ statusCode: 400, statusMessage: 'Cannot modify your own account' })

  const updated = await prisma.user.update({
    where:  { id },
    data:   body,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })

  return { data: updated }
})
