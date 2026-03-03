import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { sendProposalEmail } from '@/lib/email'

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
      if (!client) return NextResponse.json({ proposals: [], total: 0 })
      where = { clientId: client.id, status: { not: 'DRAFT' } }
    } else {
      const clientId = searchParams.get('clientId')
      const status = searchParams.get('status')
      if (clientId) where.clientId = clientId
      if (status) where.status = status
    }

    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { name: true, email: true, company: true } } },
      }),
      prisma.proposal.count({ where }),
    ])

    return NextResponse.json({ proposals, total })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const { clientId, title, executive, content, sections, aiGenerated = false, sendEmail: shouldSend = false } = body

    if (!clientId || !title) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })

    const proposal = await prisma.proposal.create({
      data: {
        clientId, title, executive: executive || '',
        content: content || '',
        sections: typeof sections === 'string' ? sections : JSON.stringify(sections || []),
        aiGenerated,
        status: shouldSend ? 'SENT' : 'DRAFT',
        sentAt: shouldSend ? new Date() : null,
      },
      include: { client: true },
    })

    if (shouldSend && proposal.client) {
      sendProposalEmail({
        to: proposal.client.email,
        name: proposal.client.name,
        proposalTitle: proposal.title,
        proposalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client/proposals/${proposal.id}`,
      }).catch(console.error)
    }

    return NextResponse.json({ proposal }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden'))
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
