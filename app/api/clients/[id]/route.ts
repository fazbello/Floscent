import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        quotes: { orderBy: { createdAt: 'desc' }, take: 5 },
        proposals: { orderBy: { createdAt: 'desc' }, take: 5 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
        assets: { orderBy: { createdAt: 'desc' }, take: 10 },
        onboarding: true,
        _count: { select: { quotes: true, proposals: true, invoices: true, assets: true } },
      },
    })
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    return NextResponse.json({ client })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden'))
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const client = await prisma.client.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json({ client })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden'))
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    await prisma.client.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden'))
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
