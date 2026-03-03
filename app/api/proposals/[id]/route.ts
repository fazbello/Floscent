import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
      include: { client: true },
    })
    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (session.role === 'CLIENT') {
      const client = await prisma.client.findFirst({ where: { userId: session.userId } })
      if (!client || proposal.clientId !== client.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      if (!proposal.viewedAt) await prisma.proposal.update({ where: { id: params.id }, data: { viewedAt: new Date(), status: proposal.status === 'SENT' ? 'VIEWED' : proposal.status } })
    }

    return NextResponse.json({ proposal })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    if (session.role === 'CLIENT') {
      if (body.status === 'SIGNED' && body.signature) {
        const proposal = await prisma.proposal.update({
          where: { id: params.id },
          data: { status: 'SIGNED', signature: body.signature, signedBy: body.signedBy, signedAt: new Date() },
        })
        return NextResponse.json({ proposal })
      }
      if (body.status === 'DECLINED') {
        const proposal = await prisma.proposal.update({
          where: { id: params.id },
          data: { status: 'DECLINED', declinedAt: new Date() },
        })
        return NextResponse.json({ proposal })
      }
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (body.sections && typeof body.sections !== 'string') body.sections = JSON.stringify(body.sections)
    const proposal = await prisma.proposal.update({ where: { id: params.id }, data: body })
    return NextResponse.json({ proposal })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    await prisma.proposal.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden'))
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
