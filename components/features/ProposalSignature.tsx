'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

interface Props {
  proposalId: string
  status: string
  signedAt: string | null
  signedBy: string | null
  clientName: string
}

export default function ProposalSignature({ proposalId, status, signedAt, signedBy, clientName }: Props) {
  const router = useRouter()
  const [signature, setSignature] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function sign() {
    if (!signature.trim()) return
    setLoading(true)
    const res = await fetch(`/api/proposals/${proposalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SIGNED', signature: signature.trim(), signedBy: signature.trim() }),
    })
    setLoading(false)
    if (res.ok) { setDone(true); router.refresh() }
  }

  async function decline() {
    setLoading(true)
    await fetch(`/api/proposals/${proposalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DECLINED' }),
    })
    setLoading(false)
    router.refresh()
  }

  if (status === 'SIGNED') {
    return (
      <div className="card border-green-500/20 bg-green-500/5 text-center">
        <div className="text-green-400 text-2xl mb-2">✓</div>
        <h3 className="font-semibold text-green-400 mb-2">Proposal Signed</h3>
        <p className="text-dark-400 text-sm">Signed by <strong className="text-dark-200">{signedBy || clientName}</strong></p>
        {signedAt && <p className="text-dark-500 text-xs mt-1">on {formatDate(signedAt)}</p>}
        <div className="mt-4 p-3 bg-dark-800 rounded-lg border border-dark-700">
          <p className="font-serif text-xl text-dark-300 italic">{signedBy}</p>
        </div>
      </div>
    )
  }

  if (status === 'DECLINED') {
    return (
      <div className="card text-center py-6 border-dark-700">
        <p className="text-dark-400 text-sm">This proposal was declined. Contact us to discuss alternatives.</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="card border-green-500/20 bg-green-500/5 text-center">
        <div className="text-green-400 font-semibold">Proposal signed successfully!</div>
      </div>
    )
  }

  if (status === 'SENT' || status === 'VIEWED') {
    return (
      <div className="card">
        <h3 className="font-semibold text-white mb-2">Sign This Proposal</h3>
        <p className="text-dark-400 text-sm mb-4">
          By signing, you agree to the terms outlined in this proposal and authorize Floscent to proceed with your partnership.
        </p>
        <div className="mb-4">
          <label className="label">Type Your Full Name as Signature *</label>
          <input
            className="input-field font-serif text-lg italic"
            placeholder={clientName}
            value={signature}
            onChange={e => setSignature(e.target.value)}
          />
          {signature && (
            <div className="mt-2 p-3 bg-dark-800 rounded-lg border border-dark-700 text-center">
              <span className="font-serif text-xl text-dark-300 italic">{signature}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={sign}
            disabled={!signature.trim() || loading}
            className="btn-primary flex-1 justify-center"
          >
            {loading ? 'Signing…' : '✓ Sign & Accept Proposal'}
          </button>
          <button onClick={decline} disabled={loading} className="btn-danger">
            Decline
          </button>
        </div>
        <p className="text-xs text-dark-600 mt-3">
          By signing you agree to Floscent&apos;s terms and conditions. This signature is legally binding.
        </p>
      </div>
    )
  }

  return null
}
