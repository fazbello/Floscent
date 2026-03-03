'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Item { id: string; name: string; description: string; quantity: number; unitPrice: number; total: number }
interface Client { id: string; name: string; email: string; company: string | null }

export default function NewInvoicePage() {
  const router = useRouter()
  const params = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    clientId: params.get('clientId') || '',
    taxRate: 8.875,
    discount: 0,
    notes: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sendEmail: false,
  })
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: '', description: '', quantity: 1, unitPrice: 0, total: 0 },
  ])

  useEffect(() => {
    fetch('/api/clients?limit=100').then(r => r.json()).then(d => setClients(d.clients || []))
  }, [])

  const updateItem = (id: string, key: keyof Item, value: string | number) => {
    setItems(items.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [key]: value }
      if (key === 'quantity' || key === 'unitPrice') updated.total = Number(updated.quantity) * Number(updated.unitPrice)
      return updated
    }))
  }

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const taxAmount = (subtotal - form.discount) * (form.taxRate / 100)
  const total = subtotal - form.discount + taxAmount

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clientId) { setError('Select a client'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(`/admin/invoices/${data.invoice.id}`)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Invoice</h1>
        </div>
        <Link href="/admin/invoices" className="btn-ghost text-sm">← Back</Link>
      </div>

      {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      <form onSubmit={submit} className="space-y-6">
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Client *</label>
              <select className="input-field" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} required>
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input-field" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Line Items</h3>
            <button type="button" onClick={() => setItems([...items, { id: Date.now().toString(), name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }])} className="btn-secondary text-xs py-1.5">+ Add Item</button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-5">
                  {i === 0 && <label className="label">Item</label>}
                  <input className="input-field" placeholder="Service name" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="label">Qty</label>}
                  <input type="number" min="1" className="input-field" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="label">Price</label>}
                  <input type="number" min="0" step="0.01" className="input-field" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))} />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="label">Total</label>}
                  <div className="input-field bg-dark-900 text-gold-500 text-sm">{formatCurrency(item.total)}</div>
                </div>
                <div className="col-span-1 flex items-end pb-0.5">
                  {items.length > 1 && <button type="button" onClick={() => setItems(items.filter(it => it.id !== item.id))} className="btn-ghost text-red-400 py-2.5 px-2 text-xs">✕</button>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-dark-400"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-dark-400 flex-1">Tax (%)</span>
                <input type="number" min="0" step="0.01" className="input-field w-20 py-1" value={form.taxRate} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) })} />
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-dark-700">
                <span className="text-dark-200">Total</span>
                <span className="text-gold-500">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <div>
            <label className="label">Notes</label>
            <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-5 rounded-full relative transition-colors ${form.sendEmail ? 'bg-gold-500' : 'bg-dark-700'}`} onClick={() => setForm({ ...form, sendEmail: !form.sendEmail })}>
              <div className={`absolute top-0 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.sendEmail ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-dark-300">Send invoice to client immediately</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating…' : 'Create Invoice'}</button>
          <Link href="/admin/invoices" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
