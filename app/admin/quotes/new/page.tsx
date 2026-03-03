'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface QuoteItem {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Client {
  id: string
  name: string
  email: string
  company: string | null
}

export default function NewQuotePage() {
  const router = useRouter()
  const params = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    clientId: params.get('clientId') || '',
    title: '',
    description: '',
    taxRate: 0,
    discount: 0,
    notes: '',
    terms: 'Payment due within 14 days of invoice date.',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sendEmail: false,
  })

  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', name: '', description: '', quantity: 1, unitPrice: 0, total: 0 },
  ])

  const [aiForm, setAiForm] = useState({ serviceType: '', requirements: '', budget: '' })
  const [showAI, setShowAI] = useState(false)

  useEffect(() => {
    fetch('/api/clients?limit=100').then(r => r.json()).then(d => setClients(d.clients || []))
  }, [])

  const updateItem = (id: string, key: keyof QuoteItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [key]: value }
      if (key === 'quantity' || key === 'unitPrice') {
        updated.total = Number(updated.quantity) * Number(updated.unitPrice)
      }
      return updated
    }))
  }

  const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }])
  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id))

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const discount = form.discount
  const taxAmount = (subtotal - discount) * (form.taxRate / 100)
  const total = subtotal - discount + taxAmount

  async function generateWithAI() {
    const client = clients.find(c => c.id === form.clientId)
    if (!client) { setError('Select a client first'); return }
    if (!aiForm.serviceType || !aiForm.requirements) { setError('Fill in service type and requirements for AI generation'); return }
    setAiLoading(true); setError('')
    try {
      const res = await fetch('/api/ai/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: client.name,
          clientCompany: client.company,
          serviceType: aiForm.serviceType,
          requirements: aiForm.requirements,
          budget: aiForm.budget,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setForm(f => ({ ...f, title: data.title, notes: data.notes }))
      setItems(data.items)
      setShowAI(false)
    } catch { setError('AI generation failed') } finally { setAiLoading(false) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clientId) { setError('Select a client'); return }
    if (items.length === 0) { setError('Add at least one item'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items, aiGenerated: showAI }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(`/admin/quotes/${data.quote.id}`)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Quote</h1>
          <p className="section-subtitle">Create a custom quote for a client</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowAI(!showAI)} className="btn-secondary text-sm">
            ✦ {showAI ? 'Hide AI' : 'Generate with AI'}
          </button>
          <Link href="/admin/quotes" className="btn-ghost text-sm">← Back</Link>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      {/* AI Panel */}
      {showAI && (
        <div className="card mb-6 border-gold-500/30 bg-gold-500/5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gold-500 text-lg">✦</span>
            <h3 className="font-semibold text-white">AI Quote Generator</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">Service Type</label>
              <input className="input-field" placeholder="e.g. Luxury Perfume Vending Machine – Prestige Package" value={aiForm.serviceType} onChange={e => setAiForm({ ...aiForm, serviceType: e.target.value })} />
            </div>
            <div>
              <label className="label">Requirements</label>
              <textarea className="input-field min-h-[80px] resize-none" placeholder="Describe the client's needs, location type, expected foot traffic, etc." value={aiForm.requirements} onChange={e => setAiForm({ ...aiForm, requirements: e.target.value })} />
            </div>
            <div>
              <label className="label">Budget Range (optional)</label>
              <input className="input-field" placeholder="e.g. $20,000 – $30,000" value={aiForm.budget} onChange={e => setAiForm({ ...aiForm, budget: e.target.value })} />
            </div>
            <button type="button" onClick={generateWithAI} disabled={aiLoading} className="btn-primary">
              {aiLoading ? '✦ Generating…' : '✦ Generate Quote Items'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="font-semibold text-white">Quote Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Client *</label>
              <select className="input-field" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} required>
                <option value="">Select client…</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Valid Until</label>
              <input type="date" className="input-field" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Title *</label>
            <input className="input-field" placeholder="e.g. Prestige Package – 3 Floscent Machines" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field resize-none" rows={2} placeholder="Brief description…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>

        {/* Line Items */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Line Items</h3>
            <button type="button" onClick={addItem} className="btn-secondary text-xs py-1.5">+ Add Item</button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  {i === 0 && <label className="label">Item Name</label>}
                  <input className="input-field" placeholder="Service/Product" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                </div>
                <div className="col-span-3">
                  {i === 0 && <label className="label">Description</label>}
                  <input className="input-field" placeholder="Details…" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                </div>
                <div className="col-span-1">
                  {i === 0 && <label className="label">Qty</label>}
                  <input type="number" min="1" className="input-field" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="label">Unit Price</label>}
                  <input type="number" min="0" step="0.01" className="input-field" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))} />
                </div>
                <div className="col-span-1 flex items-end">
                  {i === 0 && <label className="label">Total</label>}
                  <div className="input-field bg-dark-900 text-gold-500 font-medium text-sm">{formatCurrency(item.total)}</div>
                </div>
                <div className="col-span-1 flex items-end pb-0.5">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(item.id)} className="btn-ghost text-red-400 hover:text-red-300 text-xs py-2.5 px-2">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Subtotal</span>
                <span className="text-dark-200">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-dark-400 flex-1">Discount ($)</span>
                <input type="number" min="0" step="0.01" className="input-field w-24 py-1" value={form.discount} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-dark-400 flex-1">Tax (%)</span>
                <input type="number" min="0" max="100" step="0.01" className="input-field w-24 py-1" value={form.taxRate} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) })} />
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-dark-700">
                <span className="text-dark-200">Total</span>
                <span className="text-gold-500">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label">Notes</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Additional notes for the client…" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div>
            <label className="label">Terms & Conditions</label>
            <textarea className="input-field resize-none" rows={2} value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-5 rounded-full transition-colors ${form.sendEmail ? 'bg-gold-500' : 'bg-dark-700'}`} onClick={() => setForm({ ...form, sendEmail: !form.sendEmail })}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.sendEmail ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-dark-300">Send quote to client immediately</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Create Quote'}</button>
          <Link href="/admin/quotes" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
