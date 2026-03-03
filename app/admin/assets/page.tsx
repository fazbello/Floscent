'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

interface Asset {
  id: string
  name: string
  type: string
  url: string | null
  description: string | null
  tags: string | null
  status: string
  version: string | null
  createdAt: string
  client: { name: string }
}

const TYPE_ICONS: Record<string, string> = {
  IMAGE: '🖼', DOCUMENT: '📄', VIDEO: '🎬', LOGO: '◈', BRAND_ASSET: '✦', CONTRACT: '📋', FILE: '📁', OTHER: '◉',
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ clientId: '', name: '', type: 'FILE', url: '', description: '', tags: '' })
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/assets').then(r => r.json()),
      fetch('/api/clients?limit=100').then(r => r.json()),
    ]).then(([a, c]) => {
      setAssets(a.assets || [])
      setClients(c.clients || [])
      setLoading(false)
    })
  }, [])

  const filtered = assets.filter(a =>
    (!search || a.name.toLowerCase().includes(search.toLowerCase()) || (a.tags || '').toLowerCase().includes(search.toLowerCase())) &&
    (!typeFilter || a.type === typeFilter)
  )

  async function addAsset(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (res.ok) { setAssets([data.asset, ...assets]); setShowAdd(false); setForm({ clientId: '', name: '', type: 'FILE', url: '', description: '', tags: '' }) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Tracker</h1>
          <p className="section-subtitle">{assets.length} total assets</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Asset</button>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md mx-4">
            <h3 className="font-semibold text-white mb-4">Add Asset</h3>
            <form onSubmit={addAsset} className="space-y-3">
              <div>
                <label className="label">Client</label>
                <select className="input-field" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} required>
                  <option value="">Select client…</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Name</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {['FILE', 'IMAGE', 'DOCUMENT', 'VIDEO', 'LOGO', 'BRAND_ASSET', 'CONTRACT', 'OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">URL / Link</label>
                <input className="input-field" type="url" placeholder="https://…" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Tags</label>
                <input className="input-field" placeholder="logo, final, v2" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Add Asset</button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input placeholder="Search assets…" className="input-field pl-8" value={search} onChange={e => setSearch(e.target.value)} />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">⌕</span>
        </div>
        <select className="input-field w-36" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {Object.keys(TYPE_ICONS).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-dark-500">Loading assets…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(asset => (
            <div key={asset.id} className="card hover:border-gold-500/30 transition-all group cursor-pointer">
              <div className="text-3xl mb-3">{TYPE_ICONS[asset.type] || '📁'}</div>
              <div className="font-medium text-dark-100 truncate">{asset.name}</div>
              <div className="text-xs text-dark-500 mt-0.5">{asset.client?.name}</div>
              {asset.description && <div className="text-xs text-dark-400 mt-2 line-clamp-2">{asset.description}</div>}
              <div className="flex items-center justify-between mt-3">
                <span className="badge text-xs bg-dark-800 text-dark-400">{asset.type}</span>
                {asset.version && <span className="text-xs text-dark-600">v{asset.version}</span>}
              </div>
              {asset.tags && <div className="flex flex-wrap gap-1 mt-2">{asset.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => <span key={t} className="text-xs bg-gold-500/10 text-gold-600 px-1.5 py-0.5 rounded">{t}</span>)}</div>}
              <div className="text-xs text-dark-600 mt-3">{formatDate(asset.createdAt)}</div>
              {asset.url && (
                <a href={asset.url} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-gold-500 hover:text-gold-400 block truncate">
                  ↗ {asset.url.replace('https://', '').slice(0, 30)}…
                </a>
              )}
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center py-16 text-dark-500">No assets found</div>
          )}
        </div>
      )}
    </div>
  )
}
