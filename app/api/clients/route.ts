import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin(req)
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { company: { contains: search } },
        ],
      }),
      ...(status && { status }),
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { quotes: true, proposals: true, invoices: true, assets: true } },
        },
      }),
      prisma.client.count({ where }),
    ])

    return NextResponse.json({ clients, total, page, pages: Math.ceil(total / limit) })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const { name, email, phone, company, address, city, state, country, status, source, notes, tags } = body
    if (!name || !email) return NextResponse.json({ error: 'Name and email required' }, { status: 400 })

    const existing = await prisma.client.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return NextResponse.json({ error: 'Client with this email already exists' }, { status: 409 })

    const client = await prisma.client.create({
      data: { name, email: email.toLowerCase(), phone, company, address, city, state, country: country || 'US', status: status || 'PROSPECT', source, notes, tags },
    })
    return NextResponse.json({ client }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden'))
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
