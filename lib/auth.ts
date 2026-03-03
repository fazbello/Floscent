import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import prisma from './db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

export interface JWTPayload {
  userId: string
  email: string
  role: string
  sessionId: string
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getSession(req?: NextRequest): Promise<JWTPayload | null> {
  let token: string | undefined

  if (req) {
    token = req.cookies.get('floscent_token')?.value
  } else {
    const cookieStore = cookies()
    token = cookieStore.get('floscent_token')?.value
  }

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  // Verify session exists in DB
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, role: true, isActive: true } } },
  })

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    return null
  }

  return payload
}

export async function requireAuth(req?: NextRequest): Promise<JWTPayload> {
  const session = await getSession(req)
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireAdmin(req?: NextRequest): Promise<JWTPayload> {
  const session = await requireAuth(req)
  if (session.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }
  return session
}

export function createAuthResponse(error: string, status: number) {
  return Response.json({ error }, { status })
}
