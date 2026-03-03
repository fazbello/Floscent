import prisma from '@/lib/db'
import Link from 'next/link'
import { formatDate, getStatusColor, cn } from '@/lib/utils'

export const metadata = { title: 'Proposals – Floscent Admin' }

export default async function ProposalsPage() {
  const proposals = await prisma.proposal.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { client: { select: { name: true, company: true } } },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Proposals</h1>
          <p className="section-subtitle">{proposals.length} total · {proposals.filter(p => p.status === 'SIGNED').length} signed</p>
        </div>
        <Link href="/admin/proposals/new" className="btn-primary">+ New Proposal</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {['DRAFT', 'SENT', 'VIEWED', 'SIGNED', 'DECLINED'].map(status => {
          const count = proposals.filter(p => p.status === status).length
          return (
            <div key={status} className="card py-4">
              <div className="text-xs text-dark-500 uppercase tracking-wider">{status}</div>
              <div className={`text-2xl font-bold mt-1 ${getStatusColor(status).split(' ')[0]}`}>{count}</div>
            </div>
          )
        })}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-dark-800">
              <tr>
                <th className="table-header">Title</th>
                <th className="table-header">Client</th>
                <th className="table-header">Status</th>
                <th className="table-header">AI</th>
                <th className="table-header">Created</th>
                <th className="table-header">Sent</th>
                <th className="table-header">Signed</th>
                <th className="table-header" />
              </tr>
            </thead>
            <tbody>
              {proposals.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell font-medium text-dark-100 max-w-[220px] truncate">{p.title}</td>
                  <td className="table-cell text-dark-300">{p.client.name}</td>
                  <td className="table-cell"><span className={cn('badge', getStatusColor(p.status))}>{p.status}</span></td>
                  <td className="table-cell">{p.aiGenerated ? <span className="text-gold-500 text-xs">✦ AI</span> : '—'}</td>
                  <td className="table-cell text-dark-400">{formatDate(p.createdAt)}</td>
                  <td className="table-cell text-dark-400">{p.sentAt ? formatDate(p.sentAt) : '—'}</td>
                  <td className="table-cell text-dark-400">{p.signedAt ? formatDate(p.signedAt) : '—'}</td>
                  <td className="table-cell"><Link href={`/admin/proposals/${p.id}`} className="text-gold-500 hover:text-gold-400 text-xs">View →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {proposals.length === 0 && <div className="empty-state py-12">No proposals yet. <Link href="/admin/proposals/new" className="text-gold-500">Create one →</Link></div>}
      </div>
    </div>
  )
}
