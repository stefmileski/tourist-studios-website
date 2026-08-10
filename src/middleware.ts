import { NextResponse, type NextRequest } from 'next/server'
import { GATE_COOKIE, gateToken } from '@/lib/gate'

export async function middleware(req: NextRequest) {
  const password = process.env.SITE_PASSWORD
  if (!password) return NextResponse.next()

  const { pathname } = req.nextUrl
  if (pathname === '/unlock' || pathname === '/api/unlock') return NextResponse.next()

  const cookie = req.cookies.get(GATE_COOKIE)?.value
  if (cookie && cookie === (await gateToken(password))) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = '/unlock'
  url.search = ''
  if (pathname !== '/') url.searchParams.set('from', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  // Gate everything except Next's static assets, the favicon, and the
  // crawler files (robots/sitemap), which search engines must always reach
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
