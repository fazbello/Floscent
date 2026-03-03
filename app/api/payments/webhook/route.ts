import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') || ''

  let event
  try {
    event = await constructWebhookEvent(body, sig)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as { metadata?: { invoiceId?: string }; payment_intent?: string; id: string }
        const invoiceId = session.metadata?.invoiceId

        if (invoiceId) {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'PAID', paidAt: new Date(), stripePaymentId: String(session.payment_intent || '') },
          })

          await prisma.payment.updateMany({
            where: { stripeSessionId: session.id },
            data: { status: 'COMPLETED', stripePaymentId: String(session.payment_intent || '') },
          })

          // Update client total spent
          const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
          if (invoice) {
            await prisma.client.update({
              where: { id: invoice.clientId },
              data: { totalSpent: { increment: invoice.total } },
            })
          }
        }
        break
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as { id: string }
        await prisma.payment.updateMany({
          where: { stripePaymentId: pi.id },
          data: { status: 'FAILED' },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
