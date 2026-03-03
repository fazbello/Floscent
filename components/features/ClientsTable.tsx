'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn, formatDate, getStatusColor, getInitials } from '@/lib/utils'

interface Client {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  status: string
  source: string | null
  createdAt: Date
  totalSpent: number
  _count: { quotes: number; proposals: number; invoices: number }
}

export default function ClientsTable({ initialClients }: { initialClients: Client[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [clients] = useState(initialClients)

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      (!search || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.company || '').toLowerCase().includes(q)) &&
      (!statusFilter || c.status === statusFilter)
    )
  })

  return (
    <div className="card p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b border-dark-800">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search clients…"
            className="input-field pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">⌕</span>
        </div>
        <select
          className="input-field w-36"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PROSPECT">Prospect</option>
          <option value="ONBOARDING">Onboarding</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-dark-800">
            <tr>
              <th className="table-header">Client</th>
              <th className="table-header">Status</th>
              <th className="table-header">Source</th>
              <th className="table-header text-center">Quotes</th>
              <th className="table-header text-center">Proposals</th>
              <th className="table-header">Joined</th>
              <th className="table-header" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-dark-500">
                  No clients found
                </td>
              </tr>
            ) : (
              filtered.map((client) => (
                <tr key={client.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-500/15 flex items-center justify-center text-gold-500 text-xs font-bold flex-shrink-0">
                        {getInitials(client.name)}
                      </div>
                      <div>
                        <div className="font-medium text-dark-100">{client.name}</div>
                        <div className="text-xs text-dark-500">{client.company || client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={cn('badge', getStatusColor(client.status))}>{client.status}</span>
                  </td>
                  <td className="table-cell text-dark-400">{client.source || '—'}</td>
                  <td className="table-cell text-center text-dark-300">{client._count.quotes}</td>
                  <td className="table-cell text-center text-dark-300">{client._count.proposals}</td>
                  <td className="table-cell text-dark-400">{formatDate(client.createdAt)}</td>
                  <td className="table-cell">
                    <Link href={`/admin/clients/${client.id}`} className="text-gold-500 hover:text-gold-400 text-xs font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-dark-800 text-xs text-dark-500">
        Showing {filtered.length} of {clients.length} clients
      </div>
    </div>
  )
}
