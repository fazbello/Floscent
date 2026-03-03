'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Client { id: string; name: string; email: string; company: string | null }
interface Section { id: string; title: string; content: string; order: number }

const DEFAULT_SECTIONS: Section[] = [
  { id: '1', title: 'Executive Summary', content: '', order: 1 },
  { id: '2', title: 'Understanding Your Needs', content: '', order: 2 },
  { id: '3', title: 'Our Approach', content: '', order: 3 },
  { id: '4', title: 'Deliverables', content: '', order: 4 },
  { id: '5', title: 'Timeline', content: '', order: 5 },
  { id: '6', title: 'Investment', content: '', order: 6 },
  { id: '7', title: 'Why Floscent', content: '', order: 7 },
  { id: '8', title: 'Next Steps', content: '', order: 8 },
]

export default function NewProposalPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAI, setShowAI] = useState(false)
  const [activeSection, setActiveSection] = useState(0)

  const [form, setForm] = useState({
    clientId: params.get('clientId') || '',
    title: '',
    executive: '',
    sendEmail: false,
  })
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS)
  const [aiForm, setAiForm] = useState({ serviceType: '', requirements: '', budget: '', timeline: '' })

  useEffect(() => {
    fetch('/api/clients?limit=100').then(r => r.json()).then(d => setClients(d.clients || []))
  }, [])

  const updateSection = (id: string, field: 'title' | 'content', value: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  async function generateWithAI() {
    const client = clients.find(c => c.id === form.clientId)
    if (!client) { setError('Select a client first'); return }
    if (!aiForm.serviceType || !aiForm.requirements) { setError('Fill in service type and requirements'); return }
    setAiLoading(true); setError('')
    try {
      const res = await fetch('/api/ai/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: client.name,
          clientCompany: client.company,
          serviceType: aiForm.serviceType,
          requirements: aiForm.requirements,
          budget: aiForm.budget,
          timeline: aiForm.timeline,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setForm(f => ({ ...f, title: data.title, executive: data.executive }))
      if (data.sections) setSections(data.sections)
      setShowAI(false)
    } catch { setError('AI generation failed') } finally { setAiLoading(false) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clientId) { setError('Select a client'); return }
    if (!form.title) { setError('Add a title'); return }
    setLoading(true); setError('')
    try {
      const content = sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n')
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, content, sections, aiGenerated: aiLoading }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(`/admin/proposals/${data.proposal.id}`)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-5xl animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Proposal</h1>
          <p className="section-subtitle">Create a professional client proposal</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowAI(!showAI)} className="btn-secondary text-sm">✦ {showAI ? 'Hide AI' : 'Generate with AI'}</button>
          <Link href="/admin/proposals" className="btn-ghost text-sm">← Back</Link>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      {showAI && (
        <div className="card mb-6 border-gold-500/30 bg-gold-500/5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gold-500 text-lg">✦</span>
            <h3 className="font-semibold text-white">AI Proposal Generator</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Service/Package Type</label>
              <input className="input-field" placeholder="e.g. Prestige Package – 3 Machines" value={aiForm.serviceType} onChange={e => setAiForm({ ...aiForm, serviceType: e.target.value })} />
            </div>
            <div>
              <label className="label">Budget</label>
              <input className="input-field" placeholder="e.g. $25,000" value={aiForm.budget} onChange={e => setAiForm({ ...aiForm, budget: e.target.value })} />
            </div>
            <div>
              <label className="label">Requirements / Client Context</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Hotel lobby in Dubai, expects 500+ visitors/day, luxury clientele…" value={aiForm.requirements} onChange={e => setAiForm({ ...aiForm, requirements: e.target.value })} />
            </div>
            <div>
              <label className="label">Timeline</label>
              <input className="input-field" placeholder="e.g. 3 months to deployment" value={aiForm.timeline} onChange={e => setAiForm({ ...aiForm, timeline: e.target.value })} />
            </div>
          </div>
          <button type="button" onClick={generateWithAI} disabled={aiLoading} className="btn-primary mt-4">
            {aiLoading ? '✦ Generating all sections…' : '✦ Generate Full Proposal'}
          </button>
        </div>
      )}

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
              <label className="label">Title *</label>
              <input className="input-field" placeholder="Proposal title…" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Executive Summary</label>
            <textarea className="input-field resize-none" rows={3} placeholder="2–3 sentence summary of this proposal…" value={form.executive} onChange={e => setForm({ ...form, executive: e.target.value })} />
          </div>
        </div>

        {/* Sections Editor */}
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1">
            {sections.map((s, i) => (
              <button key={s.id} type="button" onClick={() => setActiveSection(i)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === i ? 'bg-gold-500/15 text-gold-500 border border-gold-500/30' : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'}`}>
                {s.title || `Section ${i + 1}`}
              </button>
            ))}
            <button type="button" onClick={() => setSections([...sections, { id: Date.now().toString(), title: 'New Section', content: '', order: sections.length + 1 }])} className="w-full text-left px-3 py-2 rounded-lg text-xs text-dark-600 hover:text-dark-400 transition-colors">
              + Add Section
            </button>
          </div>
          <div className="col-span-3 card space-y-3">
            <div>
              <label className="label">Section Title</label>
              <input className="input-field" value={sections[activeSection]?.title || ''} onChange={e => updateSection(sections[activeSection].id, 'title', e.target.value)} />
            </div>
            <div>
              <label className="label">Content (supports HTML)</label>
              <textarea className="input-field resize-none min-h-[220px] font-mono text-sm" placeholder="<p>Section content here…</p>" value={sections[activeSection]?.content || ''} onChange={e => updateSection(sections[activeSection].id, 'content', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-5 rounded-full transition-colors relative ${form.sendEmail ? 'bg-gold-500' : 'bg-dark-700'}`} onClick={() => setForm({ ...form, sendEmail: !form.sendEmail })}>
              <div className={`absolute top-0 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.sendEmail ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-dark-300">Send proposal to client immediately</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Create Proposal'}</button>
          <Link href="/admin/proposals" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
