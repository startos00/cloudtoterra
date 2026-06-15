import { NextResponse } from 'next/server'
import { makeToken, ADMIN_COOKIE } from '@/lib/admin-auth'

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}) as { password?: string })
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ data: null, error: 'unauthorised' }, { status: 401 })
  }
  const token = makeToken(process.env.ADMIN_SESSION_SECRET ?? '')
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
