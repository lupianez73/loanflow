// GET /api/loans — List loan applications with filtering + pagination
// Demonstrates parameterized queries (Prisma prevents SQL injection automatically)
import { z } from 'zod'

const querySchema = z.object({
  page:     z.coerce.number().min(1).default(1),
  limit:    z.coerce.number().min(1).max(100).default(20),
  status:   z.string().optional(),
  loanType: z.string().optional(),
  search:   z.string().optional(),
  sortBy:   z.enum(['submittedAt', 'loanAmount', 'borrowerLastName']).default('submittedAt'),
  sortDir:  z.enum(['asc', 'desc']).default('desc'),
})

export default defineEventHandler(async (event) => {
  const user   = await requireAuth(event)
  const params = await getValidatedQuery(event, querySchema.parse)
  const skip   = (params.page - 1) * params.limit

  // Dynamic WHERE clause — Prisma builds parameterized SQL (safe from injection)
  const where: Record<string, unknown> = {}
  if (user.role === 'LOAN_OFFICER') where.assignedOfficerId = user.id
  if (params.status)   where.status   = params.status
  if (params.loanType) where.loanType = params.loanType
  if (params.search) {
    where.OR = [
      { borrowerFirstName: { contains: params.search } },
      { borrowerLastName:  { contains: params.search } },
      { borrowerEmail:     { contains: params.search } },
      { applicationNo:     { contains: params.search } },
    ]
  }

  const [total, applications] = await Promise.all([
    prisma.loanApplication.count({ where }),
    prisma.loanApplication.findMany({
      where,
      skip,
      take:    params.limit,
      orderBy: { [params.sortBy]: params.sortDir },
      select: {
        id: true, applicationNo: true, status: true, loanType: true,
        loanAmount: true, borrowerFirstName: true, borrowerLastName: true,
        borrowerEmail: true, submittedAt: true,
        assignedOfficer: { select: { id: true, name: true } },
        _count: { select: { documents: true, notes: true } },
      },
    }),
  ])

  return {
    data:       applications,
    pagination: { total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) },
  }
})
