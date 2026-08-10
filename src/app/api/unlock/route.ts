import { NextResponse, type NextRequest } from 'next/server'
import { GATE_COOKIE, gateToken } from '@/lib/gate'

export async function POST(req: NextRequest) {
  const password = process.env.SITE_PASSWORD
  const form = await req.formData()
  const attempt = String(form.get('password') ?? '')
  const fromRaw = String(form.get('from') ?? '/')
  const from = fromRaw.startsWith('/') && !fromRaw.startsWith('//') ? fromRaw : '/'

  if (!password || attempt !== password) {
    const url = new URL('/unlock', req.url)
    url.searchParams.set('error', '1')
    if (from !== '/') url.searchParams.set('from', from)
    return NextResponse.redirect(url, 303)
  }

  const res = NextResponse.redirect(new URL(from, req.url), 303)
  res.cookies.set(GATE_COOKIE, await gateToken(password), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
