import { createHash } from 'node:crypto'
import { and, eq, gte, sql } from 'drizzle-orm'
import { nodes } from './schema'
import type { Db } from './db'

const SALT = process.env.ADMIN_SESSION_SECRET ?? 'dev-salt'

export function ipHash(ip: string): string {
  return createHash('sha256').update(SALT + '|' + ip).digest('hex')
}

export function isHoneypotTripped(body: { website?: string }): boolean {
  return !!body.website && body.website.trim().length > 0
}

export async function recentCountForIp(db: Db, hash: string, minutes: number): Promise<number> {
  const since = new Date(Date.now() - minutes * 60_000)
  const rows = await db
    .select({ n: sql<number>`count(*)` })
    .from(nodes)
    .where(and(eq(nodes.ipHash, hash), gte(nodes.createdAt, since)))
  return Number(rows[0]?.n ?? 0)
}

export const RATE_LIMIT = { windowMinutes: 60, max: 10 } // max submissions / ip / hour

// Resolve a client IP. Prefer the platform-trusted header (Vercel sets x-real-ip),
// then the left-most X-Forwarded-For, then a shared fallback. XFF is spoofable, so
// this is best-effort signal, not a security boundary.
export function clientIp(req: Request): string {
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return '0.0.0.0'
}

// In-memory, per-instance brute-force throttle for the admin login (defense-in-depth;
// not shared across serverless instances). Keyed by hashed IP, counts FAILED attempts.
const loginAttempts = new Map<string, { count: number; first: number }>()
export const LOGIN_LIMIT = { windowMinutes: 15, max: 8 }

export function isLoginThrottled(key: string, nowMs: number): boolean {
  const e = loginAttempts.get(key)
  if (!e) return false
  if (nowMs - e.first > LOGIN_LIMIT.windowMinutes * 60_000) { loginAttempts.delete(key); return false }
  return e.count >= LOGIN_LIMIT.max
}

export function recordFailedLogin(key: string, nowMs: number): void {
  const e = loginAttempts.get(key)
  if (!e || nowMs - e.first > LOGIN_LIMIT.windowMinutes * 60_000) {
    loginAttempts.set(key, { count: 1, first: nowMs })
    return
  }
  e.count++
}
