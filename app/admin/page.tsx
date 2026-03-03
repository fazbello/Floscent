import prisma from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import DashboardCharts from '@/components/features/DashboardCharts'

async function getStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalClients, newClientsThisMonth,
    totalQuotes, acceptedQuotes,
    totalRevenue, revenueThisMonth,
    pendingInvoices,
    recentClients,
    recentQuotes,
    recentActivity,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.quote.count(),
    prisma.quote.count({ where: { status: 'ACCEPTED' } }),
    prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { total: true } }),
    prisma.invoice.aggregate({ where: { status: 'PAID', paidAt: { gte: startOfMonth } }, _sum: { total: true } }),
    prisma.invoice.aggregate({ where: { status: 'UNPAID' }, _sum: { total: true } }),
    prisma.client.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, company: true, status: true, createdAt: true } }),
    prisma.quote.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { client: { select: { name: true } } } }),
    prisma.activityLog.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
  ])

  return {
    totalClients, newClientsThisMonth,
    totalQuotes, acceptedQuotes,
    quoteConversion: totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0,
    totalRevenue: totalRevenue._sum.total || 0,
    revenueThisMonth: revenueThisMonth._sum.total || 0,
    pendingRevenue: pendingInvoices._sum.total || 0,
    recentClients, recentQuotes, recentActivity,
  }
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-400/10 text-green-400',
  PROSPECT: 'bg-blue-400/10 text-blue-400',
  ONBOARDING: 'bg-yellow-400/10 text-yellow-400',
  INACTIVE: 'bg-gray-400/10 text-gray-400',
  DRAFT: 'bg-gray-400/10 text-gray-400',
  SENT: 'bg-blue-400/10 text-blue-400',
  ACCEPTED: 'bg-green-400/10 text-green-400',
  DECLINED: 'bg-red-400/10 text-red-400',
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, sub: `+${stats.newClientsThisMonth} this month`, color: 'text-blue-400' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), sub: `${formatCurrency(stats.revenueThisMonth)} this month`, color: 'text-green-400' },
    { label: 'Quote Conversion', value: `${stats.quoteConversion}%`, sub: `${stats.acceptedQuotes}/${stats.totalQuotes} accepted`, color: 'text-gold-500' },
    { label: 'Pending Revenue', value: formatCurrency(stats.pendingRevenue), sub: 'Unpaid invoices', color: 'text-orange-400' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="section-subtitle">Welcome back. Here&apos;s what&apos;s happening at Floscent.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/clients/new" className="btn-primary text-sm">+ New Client</Link>
          <Link href="/admin/quotes/new" className="btn-secondary text-sm">+ New Quote</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="text-xs text-dark-500 uppercase tracking-wider">{s.label}</div>
            <div className={`text-2xl font-bold font-serif mt-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-dark-500 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Clients</h3>
            <Link href="/admin/clients" className="text-xs text-gold-500 hover:text-gold-400">View all →</Link>
          </div>
          <div className="space-y-3">
            {stats.recentClients.map((client) => (
              <Link key={client.id} href={`/admin/clients/${client.id}`} className="flex items-center gap-3 hover:bg-dark-800 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-gold-500/15 flex items-center justify-center text-gold-500 text-sm font-bold flex-shrink-0">
                  {client.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-dark-100 truncate">{client.name}</div>
                  <div className="text-xs text-dark-500 truncate">{client.company || client.email}</div>
                </div>
                <span className={`badge text-xs ${STATUS_COLORS[client.status] || 'bg-gray-400/10 text-gray-400'}`}>
                  {client.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Quotes</h3>
            <Link href="/admin/quotes" className="text-xs text-gold-500 hover:text-gold-400">View all →</Link>
          </div>
          <div className="space-y-3">
            {stats.recentQuotes.map((quote) => (
              <Link key={quote.id} href={`/admin/quotes/${quote.id}`} className="flex items-center gap-3 hover:bg-dark-800 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-dark-100 truncate">{quote.title}</div>
                  <div className="text-xs text-dark-500">{quote.client.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gold-500">{formatCurrency(quote.total)}</div>
                  <span className={`badge text-xs ${STATUS_COLORS[quote.status] || ''}`}>{quote.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/clients/new', icon: '◉', label: 'Add Client' },
            { href: '/admin/quotes/new', icon: '◈', label: 'Create Quote' },
            { href: '/admin/proposals/new', icon: '✦', label: 'New Proposal' },
            { href: '/admin/ai', icon: '◐', label: 'AI Assistant' },
          ].map((action) => (
            <Link key={action.href} href={action.href} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dark-700 hover:border-gold-500/40 hover:bg-gold-500/5 transition-all text-center group">
              <span className="text-2xl text-dark-400 group-hover:text-gold-500 transition-colors">{action.icon}</span>
              <span className="text-sm text-dark-400 group-hover:text-dark-200 transition-colors">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
