import prisma from '@/lib/db'
import Link from 'next/link'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'

export const metadata = { title: 'Payments – Floscent Admin' }

export default async function PaymentsPage() {
  const [invoices, payments, totals] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { client: { select: { name: true, email: true } } },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { invoice: { include: { client: { select: { name: true } } } } },
    }),
    prisma.invoice.groupBy({
      by: ['status'],
      _sum: { total: true },
      _count: { _all: true },
    }),
  ])

  const paid = totals.find(t => t.status === 'PAID')
  const unpaid = totals.find(t => t.status === 'UNPAID')
  const overdue = totals.find(t => t.status === 'OVERDUE')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="section-subtitle">Invoice and payment management</p>
        </div>
        <Link href="/admin/invoices/new" className="btn-primary">+ New Invoice</Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs text-dark-500 uppercase tracking-wider">Total Collected</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(paid?._sum.total || 0)}</div>
          <div className="text-xs text-dark-500 mt-0.5">{paid?._count._all || 0} paid invoices</div>
        </div>
        <div className="card">
          <div className="text-xs text-dark-500 uppercase tracking-wider">Outstanding</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">{formatCurrency(unpaid?._sum.total || 0)}</div>
          <div className="text-xs text-dark-500 mt-0.5">{unpaid?._count._all || 0} unpaid invoices</div>
        </div>
        <div className="card">
          <div className="text-xs text-dark-500 uppercase tracking-wider">Overdue</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(overdue?._sum.total || 0)}</div>
          <div className="text-xs text-dark-500 mt-0.5">{overdue?._count._all || 0} overdue invoices</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
          <h3 className="font-semibold text-white">All Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-dark-800">
              <tr>
                <th className="table-header">Invoice #</th>
                <th className="table-header">Client</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Due Date</th>
                <th className="table-header">Paid</th>
                <th className="table-header" />
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="table-row">
                  <td className="table-cell font-mono text-dark-200 text-xs">{inv.invoiceNumber}</td>
                  <td className="table-cell text-dark-300">{inv.client.name}</td>
                  <td className="table-cell font-medium text-gold-500">{formatCurrency(inv.total)}</td>
                  <td className="table-cell"><span className={cn('badge', getStatusColor(inv.status))}>{inv.status}</span></td>
                  <td className="table-cell text-dark-400">{inv.dueDate ? formatDate(inv.dueDate) : '—'}</td>
                  <td className="table-cell text-dark-400">{inv.paidAt ? formatDate(inv.paidAt) : '—'}</td>
                  <td className="table-cell">
                    <Link href={`/admin/invoices/${inv.id}`} className="text-gold-500 hover:text-gold-400 text-xs">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {invoices.length === 0 && <div className="empty-state py-10">No invoices yet.</div>}
      </div>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-dark-800">
            <h3 className="font-semibold text-white">Recent Payment Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-dark-800">
                <tr>
                  <th className="table-header">Client</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Method</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell text-dark-300">{p.invoice.client.name}</td>
                    <td className="table-cell font-medium text-gold-500">{formatCurrency(p.amount)}</td>
                    <td className="table-cell"><span className={cn('badge', getStatusColor(p.status))}>{p.status}</span></td>
                    <td className="table-cell text-dark-400">{p.paymentMethod || 'Stripe'}</td>
                    <td className="table-cell text-dark-400">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
