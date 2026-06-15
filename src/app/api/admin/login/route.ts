import { NextResponse } from 'next/server'
import { makeToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { clientIp, ipHash, isLoginThrottled, recordFailedLogin } from '@/lib/abuse'

export async function POST(req: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET
  // Fail closed: an empty secret would mint a constant, attacker-computable token.
  if (!secret) {
    return NextResponse.json({ data: null, error: 'server_misconfigured' }, { status: 500 })
  }

  const key = ipHash(clientIp(req))
  const now = Date.now()
  if (isLoginThrottled(key, now)) {
    return NextResponse.json({ data: null, error: 'too_many_attempts' }, { status: 429 })
  }

  const { password } = await req.json().catch(() => ({}) as { password?: string })
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    recordFailedLogin(key, now)
    return NextResponse.json({ data: null, error: 'unauthorised' }, { status: 401 })
  }

  const token = makeToken(secret)
  const res = NextResponse.json({ data: { ok: true }, error: null })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 7,
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ data: { ok: true }, error: null })
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}
