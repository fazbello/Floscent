import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user || !user.isActive) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    // Create session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: crypto.randomUUID(),
        expiresAt,
        userAgent: req.headers.get('user-agent') || undefined,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      },
    })

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, sessionId: session.id })

    // Log activity
    await prisma.activityLog.create({
      data: { userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id },
    })

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })

    response.cookies.set('floscent_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
