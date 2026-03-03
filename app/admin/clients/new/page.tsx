'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', address: '', city: '', state: '', country: 'US',
    status: 'PROSPECT', source: '', notes: '', tags: '',
  })

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create client'); return }
      router.push(`/admin/clients/${data.client.id}`)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Client</h1>
          <p className="section-subtitle">Add a new partner or prospect</p>
        </div>
        <Link href="/admin/clients" className="btn-ghost text-sm">← Back</Link>
      </div>

      {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      <form onSubmit={submit} className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input-field" value={form.name} onChange={f('name')} required placeholder="Jane Doe" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input-field" value={form.email} onChange={f('email')} required placeholder="jane@example.com" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <input className="input-field" value={form.phone} onChange={f('phone')} placeholder="+1 555-0000" />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input-field" value={form.company} onChange={f('company')} placeholder="Company name" />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input-field" value={form.address} onChange={f('address')} placeholder="Street address" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">City</label>
            <input className="input-field" value={form.city} onChange={f('city')} placeholder="New York" />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input-field" value={form.state} onChange={f('state')} placeholder="NY" />
          </div>
          <div>
            <label className="label">Country</label>
            <select className="input-field" value={form.country} onChange={f('country')}>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AE">UAE</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            <select className="input-field" value={form.status} onChange={f('status')}>
              <option value="PROSPECT">Prospect</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div>
            <label className="label">Source</label>
            <select className="input-field" value={form.source} onChange={f('source')}>
              <option value="">Select source…</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Social Media">Social Media</option>
              <option value="Event">Event / Trade Show</option>
              <option value="Cold Outreach">Cold Outreach</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Tags</label>
          <input className="input-field" value={form.tags} onChange={f('tags')} placeholder="vip, hotel-partner, europe (comma separated)" />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input-field min-h-[80px] resize-none" value={form.notes} onChange={f('notes')} placeholder="Internal notes about this client…" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating…' : 'Create Client'}</button>
          <Link href="/admin/clients" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
