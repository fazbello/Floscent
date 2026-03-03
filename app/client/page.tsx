import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import Link from 'next/link'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'

export default async function ClientDashboard() {
  const session = await getSession()
  if (!session) return null

  const client = await prisma.client.findFirst({
    where: { userId: session.userId },
    include: {
      quotes: { orderBy: { createdAt: 'desc' }, take: 5 },
      proposals: { where: { status: { not: 'DRAFT' } }, orderBy: { createdAt: 'desc' }, take: 5 },
      invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
      onboarding: true,
      _count: { select: { quotes: true, proposals: true, invoices: true } },
    },
  })

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } })
  const pendingInvoices = client?.invoices.filter(i => i.status === 'UNPAID') || []
  const totalDue = pendingInvoices.reduce((s, i) => s + i.total, 0)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-white mb-1">
          Welcome back, {user?.name?.split(' ')[0] || 'Partner'}
        </h1>
        <p className="text-dark-400">Here&apos;s an overview of your Floscent partnership.</p>
      </div>

      {/* Pending Payment Alert */}
      {totalDue > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-yellow-500 text-lg">⚠</span>
            <div>
              <div className="font-medium text-yellow-400">Payment Due</div>
              <div className="text-sm text-dark-400">You have {formatCurrency(totalDue)} outstanding across {pendingInvoices.length} invoice(s)</div>
            </div>
          </div>
          <Link href="/client/invoices" className="btn-primary text-sm py-2">Pay Now</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'My Quotes', value: client?._count.quotes || 0, href: '/client/quotes' },
          { label: 'Proposals', value: client?._count.proposals || 0, href: '/client/proposals' },
          { label: 'Invoices', value: client?._count.invoices || 0, href: '/client/invoices' },
          { label: 'Total Invested', value: formatCurrency(client?.totalSpent || 0), href: '/client/invoices' },
        ].map(s => (
          <Link key={s.label} href={s.href} className="card hover:border-gold-500/30 transition-all group">
            <div className="text-xs text-dark-500 uppercase tracking-wider">{s.label}</div>
            <div className="text-2xl font-bold text-gold-500 mt-1 group-hover:text-gold-400">{s.value}</div>
          </Link>
        ))}
      </div>

      {/* Onboarding Progress */}
      {client?.onboarding && !client.onboarding.completed && (
        <div className="card border-gold-500/20 bg-gold-500/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Complete Your Onboarding</h3>
            <span className="text-gold-500 text-sm font-medium">{client.onboarding.step}/{client.onboarding.totalSteps}</span>
          </div>
          <div className="w-full bg-dark-800 rounded-full h-2 mb-4">
            <div className="bg-gold-500 h-2 rounded-full transition-all" style={{ width: `${(client.onboarding.step / client.onboarding.totalSteps) * 100}%` }} />
          </div>
          <p className="text-dark-400 text-sm mb-3">Complete your profile to unlock all partnership features.</p>
          <Link href="/onboard" className="btn-primary text-sm">Continue Onboarding →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Quotes</h3>
            <Link href="/client/quotes" className="text-xs text-gold-500 hover:text-gold-400">View all →</Link>
          </div>
          {client?.quotes.length === 0 ? (
            <p className="text-dark-500 text-sm">No quotes yet. Contact us to get started.</p>
          ) : (
            <div className="space-y-3">
              {client?.quotes.map(q => (
                <Link key={q.id} href={`/client/quotes/${q.id}`} className="flex items-center justify-between hover:bg-dark-800 -mx-2 px-2 py-1.5 rounded-lg transition-colors group">
                  <div>
                    <div className="text-sm text-dark-100 group-hover:text-white">{q.title}</div>
                    <div className="text-xs text-dark-500">{formatDate(q.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gold-500">{formatCurrency(q.total)}</div>
                    <span className={cn('badge text-xs', getStatusColor(q.status))}>{q.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Proposals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">My Proposals</h3>
            <Link href="/client/proposals" className="text-xs text-gold-500 hover:text-gold-400">View all →</Link>
          </div>
          {client?.proposals.length === 0 ? (
            <p className="text-dark-500 text-sm">No proposals sent yet.</p>
          ) : (
            <div className="space-y-3">
              {client?.proposals.map(p => (
                <Link key={p.id} href={`/client/proposals/${p.id}`} className="flex items-center justify-between hover:bg-dark-800 -mx-2 px-2 py-1.5 rounded-lg transition-colors group">
                  <div>
                    <div className="text-sm text-dark-100 group-hover:text-white">{p.title}</div>
                    <div className="text-xs text-dark-500">{formatDate(p.createdAt)}</div>
                  </div>
                  <span className={cn('badge text-xs', getStatusColor(p.status))}>{p.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
