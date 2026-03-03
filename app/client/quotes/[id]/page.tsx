import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate, parseJsonSafe } from '@/lib/utils'
import QuoteActions from '@/components/features/QuoteActions'

interface QuoteItem { id: string; name: string; description: string; quantity: number; unitPrice: number; total: number }

export default async function ClientQuoteDetail({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return null

  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: { client: true },
  })
  if (!quote) notFound()

  // Verify ownership
  const client = await prisma.client.findFirst({ where: { userId: session.userId } })
  if (!client || quote.clientId !== client.id) notFound()

  // Mark as viewed
  if (!quote.viewedAt) {
    await prisma.quote.update({ where: { id: params.id }, data: { viewedAt: new Date() } })
  }

  const items = parseJsonSafe<QuoteItem[]>(quote.items, [])

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-serif text-2xl font-bold text-gold-500 tracking-widest">FLOSCENT</span>
            {quote.aiGenerated && <span className="text-xs bg-gold-500/10 text-gold-500 px-2 py-0.5 rounded-full">✦ AI Generated</span>}
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-1">{quote.title}</h1>
          <p className="text-dark-400">Prepared for {quote.client.name}{quote.client.company ? ` · ${quote.client.company}` : ''}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-dark-500 uppercase tracking-wider mb-1">Total Amount</div>
          <div className="font-serif text-4xl font-bold text-gold-500">{formatCurrency(quote.total)}</div>
        </div>
      </div>

      {quote.description && (
        <div className="card mb-6">
          <p className="text-dark-300">{quote.description}</p>
        </div>
      )}

      {/* Quote Meta */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Date', value: formatDate(quote.createdAt) },
          { label: 'Valid Until', value: quote.validUntil ? formatDate(quote.validUntil) : '30 days' },
          { label: 'Status', value: quote.status },
        ].map(m => (
          <div key={m.label} className="card py-3">
            <div className="text-xs text-dark-500 uppercase tracking-wider">{m.label}</div>
            <div className="text-dark-200 font-medium mt-0.5">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Line Items */}
      <div className="card p-0 overflow-hidden mb-6">
        <table className="w-full">
          <thead className="border-b border-dark-800">
            <tr>
              <th className="table-header">Item</th>
              <th className="table-header text-center">Qty</th>
              <th className="table-header text-right">Unit Price</th>
              <th className="table-header text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="table-row">
                <td className="table-cell">
                  <div className="font-medium text-dark-100">{item.name}</div>
                  {item.description && <div className="text-xs text-dark-500 mt-0.5">{item.description}</div>}
                </td>
                <td className="table-cell text-center text-dark-300">{item.quantity}</td>
                <td className="table-cell text-right text-dark-300">{formatCurrency(item.unitPrice)}</td>
                <td className="table-cell text-right font-medium text-dark-100">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-4 border-t border-dark-800">
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-dark-400">
                <span>Subtotal</span><span>{formatCurrency(quote.subtotal)}</span>
              </div>
              {quote.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span><span>-{formatCurrency(quote.discount)}</span>
                </div>
              )}
              {quote.taxAmount > 0 && (
                <div className="flex justify-between text-dark-400">
                  <span>Tax ({quote.taxRate}%)</span><span>{formatCurrency(quote.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-dark-700">
                <span className="text-dark-200">Total</span>
                <span className="text-gold-500">{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {quote.notes && (
        <div className="card mb-6">
          <h4 className="font-semibold text-dark-200 mb-2">Notes</h4>
          <p className="text-dark-400 text-sm leading-relaxed">{quote.notes}</p>
        </div>
      )}

      {quote.terms && (
        <div className="card mb-6">
          <h4 className="font-semibold text-dark-200 mb-2">Terms & Conditions</h4>
          <p className="text-dark-400 text-sm leading-relaxed">{quote.terms}</p>
        </div>
      )}

      {/* Actions */}
      <QuoteActions quoteId={quote.id} status={quote.status} />
    </div>
  )
}
