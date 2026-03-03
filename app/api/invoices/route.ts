import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { generateInvoiceNumber, formatCurrency, formatDate } from '@/lib/utils'
import { sendInvoiceEmail } from '@/lib/email'

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
      if (!client) return NextResponse.json({ invoices: [], total: 0 })
      where = { clientId: client.id }
    } else {
      const clientId = searchParams.get('clientId')
      const status = searchParams.get('status')
      if (clientId) where.clientId = clientId
      if (status) where.status = status
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { name: true, email: true, company: true } } },
      }),
      prisma.invoice.count({ where }),
    ])

    return NextResponse.json({ invoices, total })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const { clientId, quoteId, items, taxRate = 0, discount = 0, notes, dueDate, sendEmail: shouldSend = false } = body

    if (!clientId || !items) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })

    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items
    const subtotal = parsedItems.reduce((s: number, i: { total: number }) => s + i.total, 0)
    const taxAmount = (subtotal - discount) * (taxRate / 100)
    const total = subtotal - discount + taxAmount
    const invoiceNumber = generateInvoiceNumber()

    const invoice = await prisma.invoice.create({
      data: {
        clientId, quoteId, invoiceNumber,
        items: JSON.stringify(parsedItems),
        subtotal, taxRate, taxAmount, discount, total,
        notes,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: shouldSend ? 'UNPAID' : 'DRAFT',
      },
      include: { client: true },
    })

    if (shouldSend && invoice.client) {
      sendInvoiceEmail({
        to: invoice.client.email,
        name: invoice.client.name,
        invoiceNumber: invoice.invoiceNumber,
        total: formatCurrency(invoice.total),
        dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A',
        paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client/invoices/${invoice.id}/pay`,
      }).catch(console.error)
    }

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden'))
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
