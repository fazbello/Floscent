import prisma from '@/lib/db'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import ClientsTable from '@/components/features/ClientsTable'

export const metadata = { title: 'Clients – Floscent Admin' }

export default async function ClientsPage() {
  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        _count: { select: { quotes: true, proposals: true, invoices: true } },
      },
    }),
    prisma.client.count(),
  ])

  const statusCounts = await prisma.client.groupBy({ by: ['status'], _count: { _all: true } })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="section-subtitle">{total} total clients</p>
        </div>
        <Link href="/admin/clients/new" className="btn-primary">+ Add Client</Link>
      </div>

      {/* Status Pills */}
      <div className="flex flex-wrap gap-2">
        {statusCounts.map((s) => (
          <div key={s.status} className="flex items-center gap-1.5 bg-dark-800 border border-dark-700 rounded-full px-3 py-1.5 text-xs">
            <span className="text-dark-400">{s.status}</span>
            <span className="bg-dark-700 text-dark-300 rounded-full px-1.5 py-0.5 font-medium">{s._count._all}</span>
          </div>
        ))}
      </div>

      <ClientsTable initialClients={clients} />
    </div>
  )
}
