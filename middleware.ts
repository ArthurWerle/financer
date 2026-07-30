import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'session_id'

// Presence-only check: real validation happens in the BFF on every API call
// (a stale cookie survives one page paint before the first 401 redirects).
export function middleware(request: NextRequest) {
  // Prometheus scrape endpoint: never gate it behind the session redirect.
  if (request.nextUrl.pathname === '/metrics') {
    return NextResponse.next()
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value)
  const isLoginPage = request.nextUrl.pathname === '/login'

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protect everything except Next.js internals, static assets and /metrics
    '/((?!_next/static|_next/image|favicon.ico|metrics|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp)$).*)',
  ],
}
