// POST /api/loans — Submit a new loan application
import { z } from 'zod'

const createLoanSchema = z.object({
  loanType:          z.enum(['CONVENTIONAL', 'FHA', 'VA', 'JUMBO', 'REFINANCE', 'HELOC']),
  loanAmount:        z.number().min(10000).max(10_000_000),
  loanTerm:          z.number().int().positive(),
  propertyAddress:   z.string().min(5),
  propertyValue:     z.number().min(10000),
  borrowerFirstName: z.string().min(1),
  borrowerLastName:  z.string().min(1),
  borrowerEmail:     z.string().email(),
  borrowerPhone:     z.string().min(10),
  borrowerSSN:       z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'Format: XXX-XX-XXXX'),
  annualIncome:      z.number().min(0),
  employmentStatus:  z.string().min(1),
})

async function generateApplicationNo(): Promise<string> {
  const year  = new Date().getFullYear()
  const count = await prisma.loanApplication.count()
  return `APP-${year}-${String(count + 1).padStart(6, '0')}`
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const body = await readValidatedBody(event, createLoanSchema.parse)

  // Generate app number BEFORE the transaction to avoid nested lock in SQLite
  const applicationNo = await generateApplicationNo()

  // $transaction: either ALL DB writes succeed or NONE do (atomic)
  // MS SQL equivalent: BEGIN TRANSACTION ... COMMIT / ROLLBACK
  const application = await prisma.$transaction(async (tx) => {
    const app = await tx.loanApplication.create({
      data: { ...body, applicationNo, status: 'PENDING' },
    })
    await tx.statusHistory.create({
      data: {
        applicationId: app.id,
        toStatus:      'PENDING',
        changedById:   'system',
        reason:        'Application submitted',
      },
    })
    return app
  })

  setResponseStatus(event, 201)
  return { data: application }
})
