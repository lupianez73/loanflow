import { z } from 'zod'

const schema = z.object({
  content: z.string().min(1).max(2000),
})

export default defineEventHandler(async (event) => {
  const user    = await requireAuth(event)
  const id      = getRouterParam(event, 'id')!
  const { content } = await readValidatedBody(event, schema.parse)

  const loan = await prisma.loanApplication.findUnique({ where: { id } })
  if (!loan) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const note = await prisma.loanNote.create({
    data: { applicationId: id, content, isInternal: true },
  })

  return { data: note }
})
