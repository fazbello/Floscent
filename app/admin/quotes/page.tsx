import prisma from '@/lib/db'
import Link from 'next/link'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'

export const metadata = { title: 'Quotes – Floscent Admin' }

export default async function QuotesPage() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { client: { select: { name: true, company: true } } },
  })

  const totals = {
    all: quotes.length,
    draft: quotes.filter(q => q.status === 'DRAFT').length,
    sent: quotes.filter(q => q.status === 'SENT').length,
    accepted: quotes.filter(q => q.status === 'ACCEPTED').length,
    value: quotes.filter(q => q.status === 'ACCEPTED').reduce((s, q) => s + q.total, 0),
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotes</h1>
          <p className="section-subtitle">{totals.all} quotes · {formatCurrency(totals.value)} accepted value</p>
        </div>
        <Link href="/admin/quotes/new" className="btn-primary">+ New Quote</Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: totals.all, color: 'text-dark-200' },
          { label: 'Draft', value: totals.draft, color: 'text-dark-400' },
          { label: 'Sent', value: totals.sent, color: 'text-blue-400' },
          { label: 'Accepted', value: totals.accepted, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="card py-4">
            <div className="text-xs text-dark-500 uppercase tracking-wider">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-dark-800">
              <tr>
                <th className="table-header">Title</th>
                <th className="table-header">Client</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Valid Until</th>
                <th className="table-header">AI</th>
                <th className="table-header">Created</th>
                <th className="table-header" />
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id} className="table-row">
                  <td className="table-cell font-medium text-dark-100 max-w-[200px] truncate">{q.title}</td>
                  <td className="table-cell text-dark-300">{q.client.name}</td>
                  <td className="table-cell font-medium text-gold-500">{formatCurrency(q.total)}</td>
                  <td className="table-cell"><span className={cn('badge', getStatusColor(q.status))}>{q.status}</span></td>
                  <td className="table-cell text-dark-400">{q.validUntil ? formatDate(q.validUntil) : '—'}</td>
                  <td className="table-cell">{q.aiGenerated ? <span className="text-gold-500 text-xs">✦ AI</span> : '—'}</td>
                  <td className="table-cell text-dark-400">{formatDate(q.createdAt)}</td>
                  <td className="table-cell">
                    <Link href={`/admin/quotes/${q.id}`} className="text-gold-500 hover:text-gold-400 text-xs">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {quotes.length === 0 && <div className="empty-state">No quotes yet. <Link href="/admin/quotes/new" className="text-gold-500">Create the first one →</Link></div>}
      </div>
    </div>
  )
}
