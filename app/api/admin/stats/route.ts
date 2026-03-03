import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalClients,
      newClientsThisMonth,
      newClientsLastMonth,
      totalQuotes,
      acceptedQuotes,
      totalProposals,
      signedProposals,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      pendingInvoices,
      recentActivity,
      clientsByStatus,
      revenueByMonth,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.client.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: 'ACCEPTED' } }),
      prisma.proposal.count(),
      prisma.proposal.count({ where: { status: 'SIGNED' } }),
      prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { total: true } }),
      prisma.invoice.aggregate({ where: { status: 'PAID', paidAt: { gte: startOfMonth } }, _sum: { total: true } }),
      prisma.invoice.aggregate({ where: { status: 'PAID', paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { total: true } }),
      prisma.invoice.aggregate({ where: { status: 'UNPAID' }, _sum: { total: true } }),
      prisma.activityLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, email: true } } } }),
      prisma.client.groupBy({ by: ['status'], _count: { _all: true } }),
      // Revenue for last 6 months
      prisma.$queryRaw`
        SELECT
          strftime('%Y-%m', createdAt) as month,
          SUM(total) as revenue
        FROM Invoice
        WHERE status = 'PAID' AND createdAt >= datetime('now', '-6 months')
        GROUP BY strftime('%Y-%m', createdAt)
        ORDER BY month ASC
      `,
    ])

    return NextResponse.json({
      stats: {
        totalClients,
        newClientsThisMonth,
        clientGrowth: newClientsLastMonth > 0 ? ((newClientsThisMonth - newClientsLastMonth) / newClientsLastMonth) * 100 : 0,
        totalQuotes,
        acceptedQuotes,
        quoteConversion: totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0,
        totalProposals,
        signedProposals,
        proposalConversion: totalProposals > 0 ? (signedProposals / totalProposals) * 100 : 0,
        totalRevenue: totalRevenue._sum.total || 0,
        revenueThisMonth: revenueThisMonth._sum.total || 0,
        revenueLastMonth: revenueLastMonth._sum.total || 0,
        revenueGrowth: (revenueLastMonth._sum.total || 0) > 0
          ? (((revenueThisMonth._sum.total || 0) - (revenueLastMonth._sum.total || 0)) / (revenueLastMonth._sum.total || 1)) * 100
          : 0,
        pendingRevenue: pendingInvoices._sum.total || 0,
      },
      recentActivity,
      clientsByStatus,
      revenueByMonth,
    })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden'))
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
