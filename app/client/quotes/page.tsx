import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import Link from 'next/link'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'

export const metadata = { title: 'My Quotes – Floscent' }

export default async function ClientQuotesPage() {
  const session = await getSession()
  if (!session) return null

  const client = await prisma.client.findFirst({ where: { userId: session.userId } })
  const quotes = client ? await prisma.quote.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: 'desc' },
  }) : []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Quotes</h1>
        <p className="section-subtitle">{quotes.length} quote(s) received</p>
      </div>

      {quotes.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4 text-dark-700">◈</div>
          <h3 className="font-semibold text-white mb-2">No quotes yet</h3>
          <p className="text-dark-400 text-sm mb-4">Your personalized quotes will appear here once our team creates them for you.</p>
          <Link href="/client/chat" className="btn-primary">Talk to AI Assistant →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map(q => (
            <Link key={q.id} href={`/client/quotes/${q.id}`} className="card block hover:border-gold-500/30 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {q.aiGenerated && <span className="text-gold-500 text-xs bg-gold-500/10 px-2 py-0.5 rounded-full">✦ AI</span>}
                  <div>
                    <h3 className="font-semibold text-dark-100 group-hover:text-white">{q.title}</h3>
                    <p className="text-xs text-dark-500 mt-0.5">Created {formatDate(q.createdAt)}{q.validUntil && ` · Valid until ${formatDate(q.validUntil)}`}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-xl font-bold text-gold-500 font-serif">{formatCurrency(q.total)}</div>
                    <span className={cn('badge text-xs', getStatusColor(q.status))}>{q.status}</span>
                  </div>
                  <span className="text-dark-600 group-hover:text-gold-500 text-lg transition-colors">→</span>
                </div>
              </div>
              {q.description && <p className="text-sm text-dark-400 mt-2 line-clamp-2">{q.description}</p>}
              {q.status === 'SENT' && (
                <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-sm text-blue-400">
                  Action required: Please review and accept or decline this quote.
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
