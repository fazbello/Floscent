'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function QuoteActions({ quoteId, status }: { quoteId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function updateStatus(newStatus: string) {
    setLoading(newStatus)
    const res = await fetch(`/api/quotes/${quoteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setLoading(null)
    if (res.ok) { setDone(true); router.refresh() }
  }

  if (status === 'ACCEPTED') {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
        <div className="text-green-400 font-medium text-lg mb-1">✓ Quote Accepted</div>
        <p className="text-dark-400 text-sm">Our team will be in touch with your next steps shortly.</p>
      </div>
    )
  }

  if (status === 'DECLINED') {
    return (
      <div className="p-4 bg-dark-800 border border-dark-700 rounded-xl text-center">
        <p className="text-dark-400 text-sm">This quote was declined. Contact us if you&apos;d like to discuss alternatives.</p>
      </div>
    )
  }

  if (status === 'EXPIRED') {
    return (
      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-center">
        <p className="text-orange-400 text-sm">This quote has expired. Please contact us for an updated quote.</p>
      </div>
    )
  }

  if (done) {
    return <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center text-green-400 font-medium">Response submitted!</div>
  }

  if (status === 'SENT' || status === 'VIEWED') {
    return (
      <div className="card">
        <h4 className="font-semibold text-white mb-2">Respond to This Quote</h4>
        <p className="text-dark-400 text-sm mb-4">Please review the quote above and let us know if you&apos;d like to proceed.</p>
        <div className="flex gap-3">
          <button
            onClick={() => updateStatus('ACCEPTED')}
            disabled={loading !== null}
            className="btn-primary flex-1 justify-center"
          >
            {loading === 'ACCEPTED' ? 'Processing…' : '✓ Accept Quote'}
          </button>
          <button
            onClick={() => updateStatus('DECLINED')}
            disabled={loading !== null}
            className="btn-danger flex-1 justify-center"
          >
            {loading === 'DECLINED' ? 'Processing…' : '✕ Decline'}
          </button>
        </div>
      </div>
    )
  }

  return null
}
