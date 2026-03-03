import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('floscent_token')?.value
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {})
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('floscent_token')
  return response
}
