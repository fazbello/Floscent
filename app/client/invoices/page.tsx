import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import Link from 'next/link'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'

export const metadata = { title: 'My Invoices – Floscent' }

export default async function ClientInvoicesPage() {
  const session = await getSession()
  if (!session) return null

  const client = await prisma.client.findFirst({ where: { userId: session.userId } })
  const invoices = client ? await prisma.invoice.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: 'desc' },
  }) : []

  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
  const totalDue = invoices.filter(i => i.status === 'UNPAID').reduce((s, i) => s + i.total, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Invoices</h1>
        <p className="section-subtitle">{invoices.length} invoice(s)</p>
      </div>

      {/* Summary */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <div className="text-xs text-dark-500 uppercase tracking-wider">Total Paid</div>
            <div className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalPaid)}</div>
          </div>
          <div className="card">
            <div className="text-xs text-dark-500 uppercase tracking-wider">Outstanding</div>
            <div className="text-2xl font-bold text-yellow-400 mt-1">{formatCurrency(totalDue)}</div>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4 text-dark-700">◎</div>
          <h3 className="font-semibold text-white mb-2">No invoices yet</h3>
          <p className="text-dark-400 text-sm">Invoices will appear here once your order is confirmed.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-dark-800">
              <tr>
                <th className="table-header">Invoice #</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Due Date</th>
                <th className="table-header" />
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="table-row">
                  <td className="table-cell font-mono text-dark-200 text-xs">{inv.invoiceNumber}</td>
                  <td className="table-cell font-medium text-gold-500">{formatCurrency(inv.total)}</td>
                  <td className="table-cell"><span className={cn('badge', getStatusColor(inv.status))}>{inv.status}</span></td>
                  <td className="table-cell text-dark-400">{inv.dueDate ? formatDate(inv.dueDate) : '—'}</td>
                  <td className="table-cell">
                    {inv.status === 'UNPAID' ? (
                      <Link href={`/client/invoices/${inv.id}/pay`} className="btn-primary text-xs py-1.5 px-3">Pay Now</Link>
                    ) : (
                      <Link href={`/client/invoices/${inv.id}`} className="text-gold-500 hover:text-gold-400 text-xs">View →</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
