import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { invoiceId } = await req.json()
    if (!invoiceId) return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true },
    })
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    if (invoice.status === 'PAID') return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const checkoutSession = await createCheckoutSession({
      amount: invoice.total,
      description: `Floscent Invoice #${invoice.invoiceNumber}`,
      successUrl: `${baseUrl}/client/invoices/${invoice.id}?payment=success`,
      cancelUrl: `${baseUrl}/client/invoices/${invoice.id}?payment=cancelled`,
      customerEmail: invoice.client.email,
      metadata: { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber },
    })

    // Record pending payment
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.total,
        status: 'PENDING',
        stripeSessionId: checkoutSession.id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Payment error:', err)
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let where: Record<string, unknown> = {}
    if (session.role === 'CLIENT') {
      const client = await prisma.client.findFirst({ where: { userId: session.userId } })
      if (!client) return NextResponse.json({ payments: [], total: 0 })
      where = { invoice: { clientId: client.id } }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { invoice: { include: { client: { select: { name: true } } } } },
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({ payments, total })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
