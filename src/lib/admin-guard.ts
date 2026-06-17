import { cookies } from 'next/headers'
import { verifyToken, ADMIN_COOKIE } from './admin-auth'

// True when the request carries a valid admin session cookie. Checks the request
// header first (works in route tests + runtime), then Next's request-scoped cookies().
export async function isAdminRequest(req: Request): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET ?? ''
  if (!secret) return false
  const fromHeader = req.headers.get('cookie')?.match(new RegExp(`${ADMIN_COOKIE}=([^;]+)`))?.[1]
  let token = fromHeader
  if (!token) {
    try {
      token = (await cookies()).get(ADMIN_COOKIE)?.value
    } catch {
      token = undefined
    }
  }
  return !!token && verifyToken(token, secret)
}
