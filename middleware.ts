import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/onboard',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/onboard',
  '/api/payments/webhook',
  '/sitemap.xml',
  '/robots.txt',
]

const ADMIN_PATHS = ['/admin']
const CLIENT_PATHS = ['/client']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('floscent_token')?.value

  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  const payload = await verifyToken(token)

  if (!payload) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const response = NextResponse.redirect(url)
    response.cookies.delete('floscent_token')
    return response
  }

  // Admin-only paths
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/client', request.url))
  }

  // Client paths – redirect admin to admin dashboard
  if (CLIENT_PATHS.some((p) => pathname.startsWith(p)) && payload.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Add user info to headers for server components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-role', payload.role)
  requestHeaders.set('x-user-email', payload.email)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
