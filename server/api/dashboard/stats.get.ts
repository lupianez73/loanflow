// GET /api/dashboard/stats — Aggregate loan pipeline statistics
// Demonstrates MS SQL aggregation: COUNT, SUM, AVG, GROUP BY
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const officerFilter = user.role === 'LOAN_OFFICER'
    ? { assignedOfficerId: user.id }
    : {}

  const [statusCounts, totalVolume, avgAmount, recent] = await Promise.all([
    // GROUP BY status — like SQL: SELECT status, COUNT(*) FROM loan_applications GROUP BY status
    prisma.loanApplication.groupBy({
      by:     ['status'],
      where:  officerFilter,
      _count: { id: true },
    }),

    // SUM — total funded volume (approved + closed)
    prisma.loanApplication.aggregate({
      where: { ...officerFilter, status: { in: ['APPROVED', 'CLOSED'] } },
      _sum:  { loanAmount: true },
    }),

    // AVG loan amount
    prisma.loanApplication.aggregate({
      where: officerFilter,
      _avg:  { loanAmount: true },
    }),

    // 5 most recent
    prisma.loanApplication.findMany({
      where:   officerFilter,
      orderBy: { submittedAt: 'desc' },
      take:    5,
      select: {
        id: true, applicationNo: true, status: true,
        borrowerFirstName: true, borrowerLastName: true,
        loanAmount: true, submittedAt: true,
      },
    }),
  ])

  const byStatus = Object.fromEntries(statusCounts.map(r => [r.status, r._count.id]))

  return {
    pipeline: {
      pending:          byStatus.PENDING          ?? 0,
      inReview:         byStatus.IN_REVIEW         ?? 0,
      documentsNeeded:  byStatus.DOCUMENTS_NEEDED  ?? 0,
      underwriting:     byStatus.UNDERWRITING       ?? 0,
      approved:         byStatus.APPROVED           ?? 0,
      denied:           byStatus.DENIED             ?? 0,
      closed:           byStatus.CLOSED             ?? 0,
    },
    totalFundedVolume:    totalVolume._sum.loanAmount ?? 0,
    avgLoanAmount:        avgAmount._avg.loanAmount   ?? 0,
    recentApplications:  recent,
  }
})
