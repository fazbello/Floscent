import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let where: Record<string, unknown> = { status: { not: 'DELETED' } }

    if (session.role === 'CLIENT') {
      const client = await prisma.client.findFirst({ where: { userId: session.userId } })
      if (!client) return NextResponse.json({ assets: [], total: 0 })
      where.clientId = client.id
    } else {
      if (clientId) where.clientId = clientId
    }
    if (type) where.type = type

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { name: true } } },
      }),
      prisma.asset.count({ where }),
    ])

    return NextResponse.json({ assets, total })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { clientId, name, type, url, description, tags, metadata, isPublic, version } = body

    if (!clientId || !name) return NextResponse.json({ error: 'Client ID and name required' }, { status: 400 })

    const asset = await prisma.asset.create({
      data: {
        clientId, name,
        type: type || 'FILE',
        url: url || undefined,
        description, tags,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        isPublic: isPublic || false,
        version: version || '1.0',
        uploadedBy: session.userId,
      },
    })
    return NextResponse.json({ asset }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: err.message }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
