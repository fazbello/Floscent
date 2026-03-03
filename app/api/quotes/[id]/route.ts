import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: { client: true },
    })
    if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Check client access
    if (session.role === 'CLIENT') {
      const client = await prisma.client.findFirst({ where: { userId: session.userId } })
      if (!client || quote.clientId !== client.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      // Mark as viewed
      if (!quote.viewedAt) await prisma.quote.update({ where: { id: params.id }, data: { viewedAt: new Date() } })
    }

    return NextResponse.json({ quote })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Clients can only accept/decline
    if (session.role === 'CLIENT') {
      const allowed = ['ACCEPTED', 'DECLINED']
      if (!allowed.includes(body.status)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const quote = await prisma.quote.update({
        where: { id: params.id },
        data: {
          status: body.status,
          acceptedAt: body.status === 'ACCEPTED' ? new Date() : undefined,
          declinedAt: body.status === 'DECLINED' ? new Date() : undefined,
        },
      })
      return NextResponse.json({ quote })
    }

    // Admin can update anything
    if (body.items && typeof body.items !== 'string') body.items = JSON.stringify(body.items)
    if (body.subtotal !== undefined || body.items !== undefined) {
      const items = body.items ? JSON.parse(body.items) : []
      body.subtotal = items.reduce((s: number, i: { total: number }) => s + i.total, 0)
      body.taxAmount = (body.subtotal - (body.discount || 0)) * ((body.taxRate || 0) / 100)
      body.total = body.subtotal - (body.discount || 0) + body.taxAmount
    }

    const quote = await prisma.quote.update({ where: { id: params.id }, data: body })
    return NextResponse.json({ quote })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    await prisma.quote.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden'))
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
