import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const settings = await prisma.setting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] })
    const map = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>)
    return NextResponse.json({ settings: map, list: settings })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()

    for (const [key, value] of Object.entries(body)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), type: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string' },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden'))
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
