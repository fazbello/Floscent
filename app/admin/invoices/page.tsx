import prisma from '@/lib/db'
import Link from 'next/link'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'

export const metadata = { title: 'Invoices – Floscent Admin' }

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { client: { select: { name: true, email: true } } },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="section-subtitle">{invoices.length} total</p>
        </div>
        <Link href="/admin/invoices/new" className="btn-primary">+ New Invoice</Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-dark-800">
              <tr>
                <th className="table-header">Invoice #</th>
                <th className="table-header">Client</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Due</th>
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
    </div>
  )
}
