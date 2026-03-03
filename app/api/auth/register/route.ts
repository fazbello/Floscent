import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { signToken } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, company, phone } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'Name, email, and password required' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashed,
        role: 'CLIENT',
        company: company || undefined,
        phone: phone || undefined,
      },
    })

    // Create client record
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        name,
        email: user.email,
        phone: phone || undefined,
        company: company || undefined,
        status: 'ONBOARDING',
        source: 'Registration',
      },
    })

    // Create onboarding record
    await prisma.onboarding.create({ data: { clientId: client.id } })

    // Create session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await prisma.session.create({
      data: { userId: user.id, token: crypto.randomUUID(), expiresAt },
    })

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, sessionId: session.id })

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name || 'Partner', `${process.env.NEXT_PUBLIC_APP_URL}/login`).catch(console.error)

    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
    response.cookies.set('floscent_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
