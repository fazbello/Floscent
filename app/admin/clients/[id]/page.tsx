import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDate, getStatusColor, getInitials, cn, parseJsonSafe } from '@/lib/utils'

interface QuoteItem { id: string; name: string; quantity: number; unitPrice: number; total: number }

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      quotes: { orderBy: { createdAt: 'desc' }, take: 10 },
      proposals: { orderBy: { createdAt: 'desc' }, take: 10 },
      invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
      assets: { orderBy: { createdAt: 'desc' }, take: 10, where: { status: { not: 'DELETED' } } },
      onboarding: true,
      _count: { select: { quotes: true, proposals: true, invoices: true, assets: true } },
    },
  })

  if (!client) notFound()

  const tabs = [
    { label: 'Overview', id: 'overview' },
    { label: `Quotes (${client._count.quotes})`, id: 'quotes' },
    { label: `Proposals (${client._count.proposals})`, id: 'proposals' },
    { label: `Invoices (${client._count.invoices})`, id: 'invoices' },
    { label: `Assets (${client._count.assets})`, id: 'assets' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gold-500/15 flex items-center justify-center text-gold-500 text-lg font-bold">
            {getInitials(client.name)}
          </div>
          <div>
            <h1 className="page-title">{client.name}</h1>
            <p className="section-subtitle">{client.company || client.email}</p>
          </div>
          <span className={cn('badge ml-2', getStatusColor(client.status))}>{client.status}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/quotes/new?clientId=${client.id}`} className="btn-secondary text-sm">+ Quote</Link>
          <Link href={`/admin/proposals/new?clientId=${client.id}`} className="btn-secondary text-sm">+ Proposal</Link>
          <Link href={`/admin/clients/${client.id}/edit`} className="btn-primary text-sm">Edit</Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Spent', value: formatCurrency(client.totalSpent) },
          { label: 'Quotes', value: client._count.quotes },
          { label: 'Proposals', value: client._count.proposals },
          { label: 'Invoices', value: client._count.invoices },
        ].map((s) => (
          <div key={s.label} className="card py-4">
            <div className="text-xs text-dark-500 uppercase tracking-wider">{s.label}</div>
            <div className="text-xl font-bold text-gold-500 mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-white">Contact Details</h3>
          {[
            { label: 'Email', value: client.email },
            { label: 'Phone', value: client.phone || '—' },
            { label: 'Company', value: client.company || '—' },
            { label: 'Location', value: [client.city, client.state, client.country].filter(Boolean).join(', ') || '—' },
            { label: 'Source', value: client.source || '—' },
            { label: 'Joined', value: formatDate(client.createdAt) },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-xs text-dark-500 uppercase tracking-wider">{label}</div>
              <div className="text-sm text-dark-200 mt-0.5">{value}</div>
            </div>
          ))}
          {client.notes && (
            <div>
              <div className="text-xs text-dark-500 uppercase tracking-wider">Notes</div>
              <div className="text-sm text-dark-400 mt-0.5 leading-relaxed">{client.notes}</div>
            </div>
          )}
        </div>

        {/* Onboarding Info */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-white">Onboarding Details</h3>
          {client.onboarding ? (
            <>
              {[
                { label: 'Status', value: client.onboarding.completed ? '✓ Completed' : `Step ${client.onboarding.step}/${client.onboarding.totalSteps}` },
                { label: 'Business Type', value: client.onboarding.businessType || '—' },
                { label: 'Business Size', value: client.onboarding.businessSize || '—' },
                { label: 'Budget', value: client.onboarding.budget || '—' },
                { label: 'Timeline', value: client.onboarding.timeline || '—' },
                { label: 'Package Interest', value: client.onboarding.services || '—' },
                { label: 'How They Found Us', value: client.onboarding.howDidYouHear || '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-dark-500 uppercase tracking-wider">{label}</div>
                  <div className="text-sm text-dark-200 mt-0.5">{value}</div>
                </div>
              ))}
              {client.onboarding.goals && (
                <div>
                  <div className="text-xs text-dark-500 uppercase tracking-wider">Goals</div>
                  <div className="text-sm text-dark-400 mt-0.5 leading-relaxed">{client.onboarding.goals}</div>
                </div>
              )}
            </>
          ) : (
            <p className="text-dark-500 text-sm">No onboarding data available.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Recent Quotes</h3>
          <div className="space-y-3">
            {client.quotes.slice(0, 4).map((q) => (
              <Link key={q.id} href={`/admin/quotes/${q.id}`} className="flex items-center justify-between hover:bg-dark-800 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                <div>
                  <div className="text-sm text-dark-200 truncate max-w-[150px]">{q.title}</div>
                  <div className="text-xs text-dark-500">{formatDate(q.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gold-500">{formatCurrency(q.total)}</div>
                  <span className={cn('badge text-xs', getStatusColor(q.status))}>{q.status}</span>
                </div>
              </Link>
            ))}
            {client.quotes.length === 0 && <p className="text-dark-500 text-sm">No quotes yet</p>}
          </div>
        </div>
      </div>

      {/* Proposals */}
      {client.proposals.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Proposals</h3>
            <Link href={`/admin/proposals/new?clientId=${client.id}`} className="btn-primary text-xs py-1.5">+ New Proposal</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-header">Title</th>
                <th className="table-header">Status</th>
                <th className="table-header">Created</th>
                <th className="table-header">Sent</th>
                <th className="table-header">Signed</th>
                <th className="table-header" />
              </tr></thead>
              <tbody>
                {client.proposals.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell font-medium text-dark-100">{p.title}</td>
                    <td className="table-cell"><span className={cn('badge', getStatusColor(p.status))}>{p.status}</span></td>
                    <td className="table-cell text-dark-400">{formatDate(p.createdAt)}</td>
                    <td className="table-cell text-dark-400">{p.sentAt ? formatDate(p.sentAt) : '—'}</td>
                    <td className="table-cell text-dark-400">{p.signedAt ? formatDate(p.signedAt) : '—'}</td>
                    <td className="table-cell"><Link href={`/admin/proposals/${p.id}`} className="text-gold-500 hover:text-gold-400 text-xs">View →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices */}
      {client.invoices.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Invoices</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-header">Invoice #</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Due Date</th>
                <th className="table-header" />
              </tr></thead>
              <tbody>
                {client.invoices.map((inv) => (
                  <tr key={inv.id} className="table-row">
                    <td className="table-cell font-mono text-dark-200">{inv.invoiceNumber}</td>
                    <td className="table-cell font-medium text-gold-500">{formatCurrency(inv.total)}</td>
                    <td className="table-cell"><span className={cn('badge', getStatusColor(inv.status))}>{inv.status}</span></td>
                    <td className="table-cell text-dark-400">{inv.dueDate ? formatDate(inv.dueDate) : '—'}</td>
                    <td className="table-cell"><Link href={`/admin/invoices/${inv.id}`} className="text-gold-500 hover:text-gold-400 text-xs">View →</Link></td>
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
