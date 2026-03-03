'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

export default function PayInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<{ id: string; invoiceNumber: string; total: number; status: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // We'd fetch the invoice here
    setLoading(false)
    setInvoice({ id: params.id as string, invoiceNumber: 'INV-2024-0001', total: 9500, status: 'UNPAID' })
  }, [params.id])

  async function pay() {
    setPaying(true)
    setError('')
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: params.id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Payment failed'); return }
      if (data.url) window.location.href = data.url
    } catch { setError('Payment initialization failed') } finally { setPaying(false) }
  }

  if (loading) return <div className="text-center py-16 text-dark-500">Loading…</div>

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <h1 className="page-title mb-6">Pay Invoice</h1>

      {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      <div className="card mb-6">
        <div className="text-center py-4">
          <div className="text-xs text-dark-500 uppercase tracking-wider mb-2">Amount Due</div>
          <div className="font-serif text-5xl font-bold text-gold-500 mb-2">{invoice && formatCurrency(invoice.total)}</div>
          <div className="text-sm text-dark-400">Invoice #{invoice?.invoiceNumber}</div>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-white mb-3">Secure Payment</h3>
        <p className="text-dark-400 text-sm mb-4">You will be redirected to our secure Stripe payment page. Your payment information is never stored on our servers.</p>
        <div className="flex items-center gap-2 text-xs text-dark-500">
          <span>🔒</span>
          <span>256-bit SSL encryption · Powered by Stripe</span>
        </div>
      </div>

      <button
        onClick={pay}
        disabled={paying}
        className="btn-primary w-full justify-center py-4 text-base"
      >
        {paying ? 'Redirecting to payment…' : `Pay ${invoice && formatCurrency(invoice.total)} Securely`}
      </button>

      <button onClick={() => router.back()} className="btn-ghost w-full justify-center mt-3">
        Cancel
      </button>
    </div>
  )
}
