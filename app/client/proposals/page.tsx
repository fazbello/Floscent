import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import Link from 'next/link'
import { formatDate, getStatusColor, cn } from '@/lib/utils'

export const metadata = { title: 'My Proposals – Floscent' }

export default async function ClientProposalsPage() {
  const session = await getSession()
  if (!session) return null

  const client = await prisma.client.findFirst({ where: { userId: session.userId } })
  const proposals = client ? await prisma.proposal.findMany({
    where: { clientId: client.id, status: { not: 'DRAFT' } },
    orderBy: { createdAt: 'desc' },
  }) : []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Proposals</h1>
        <p className="section-subtitle">{proposals.length} proposal(s) received</p>
      </div>

      {proposals.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4 text-dark-700">✦</div>
          <h3 className="font-semibold text-white mb-2">No proposals yet</h3>
          <p className="text-dark-400 text-sm">Our team will prepare a personalized proposal for your partnership.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(p => (
            <Link key={p.id} href={`/client/proposals/${p.id}`} className="card block hover:border-gold-500/30 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {p.aiGenerated && <span className="text-xs bg-gold-500/10 text-gold-500 px-2 py-0.5 rounded-full">✦ AI</span>}
                  <div>
                    <h3 className="font-semibold text-dark-100 group-hover:text-white">{p.title}</h3>
                    <p className="text-xs text-dark-500 mt-0.5">
                      {formatDate(p.createdAt)}
                      {p.sentAt && ` · Sent ${formatDate(p.sentAt)}`}
                      {p.signedAt && ` · Signed ${formatDate(p.signedAt)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('badge', getStatusColor(p.status))}>{p.status}</span>
                  <span className="text-dark-600 group-hover:text-gold-500 text-lg transition-colors">→</span>
                </div>
              </div>
              {p.executive && <p className="text-sm text-dark-400 mt-3 line-clamp-2 italic">&ldquo;{p.executive}&rdquo;</p>}
              {(p.status === 'SENT' || p.status === 'VIEWED') && (
                <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-sm text-blue-400">
                  Awaiting your signature. Please review and sign this proposal.
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
