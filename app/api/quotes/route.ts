import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { generateInvoiceNumber } from '@/lib/utils'
import { sendQuoteEmail } from '@/lib/email'
import { formatCurrency, formatDate } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let whereClause: Record<string, unknown> = {}

    if (session.role === 'CLIENT') {
      const client = await prisma.client.findFirst({ where: { userId: session.userId } })
      if (!client) return NextResponse.json({ quotes: [], total: 0 })
      whereClause = { clientId: client.id }
    } else {
      if (clientId) whereClause.clientId = clientId
      if (status) whereClause.status = status
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { name: true, email: true, company: true } } },
      }),
      prisma.quote.count({ where: whereClause }),
    ])

    return NextResponse.json({ quotes, total })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const { clientId, title, description, items, taxRate = 0, discount = 0, notes, terms, validUntil, aiGenerated = false, sendEmail: shouldSendEmail = false } = body

    if (!clientId || !title || !items) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })

    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items
    const subtotal = parsedItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0)
    const taxAmount = (subtotal - discount) * (taxRate / 100)
    const total = subtotal - discount + taxAmount

    const quote = await prisma.quote.create({
      data: {
        clientId, title, description,
        items: JSON.stringify(parsedItems),
        subtotal, taxRate, taxAmount, discount, total,
        notes, terms, aiGenerated,
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: shouldSendEmail ? 'SENT' : 'DRAFT',
        sentAt: shouldSendEmail ? new Date() : null,
      },
      include: { client: true },
    })

    if (shouldSendEmail && quote.client) {
      sendQuoteEmail({
        to: quote.client.email,
        name: quote.client.name,
        quoteNumber: quote.id.slice(-8).toUpperCase(),
        total: formatCurrency(quote.total),
        validUntil: quote.validUntil ? formatDate(quote.validUntil) : '30 days',
        quoteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client/quotes/${quote.id}`,
      }).catch(console.error)
    }

    return NextResponse.json({ quote }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden'))
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
