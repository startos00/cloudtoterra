import { createHmac, timingSafeEqual } from 'node:crypto'

const PAYLOAD = 'cloudtoterra-admin-v1'
export const ADMIN_COOKIE = 'ctt_admin'

export function makeToken(secret: string): string {
  const sig = createHmac('sha256', secret).update(PAYLOAD).digest('hex')
  return `${PAYLOAD}.${sig}`
}

export function verifyToken(token: string, secret: string): boolean {
  const expected = makeToken(secret)
  if (token.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}
