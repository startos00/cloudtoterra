import { createHash } from 'node:crypto'
import { and, eq, gte, sql } from 'drizzle-orm'
import { nodes } from './schema'

const SALT = process.env.ADMIN_SESSION_SECRET ?? 'dev-salt'

export function ipHash(ip: string): string {
  return createHash('sha256').update(SALT + '|' + ip).digest('hex')
}

export function isHoneypotTripped(body: { website?: string }): boolean {
  return !!body.website && body.website.trim().length > 0
}

export async function recentCountForIp(db: any, hash: string, minutes: number): Promise<number> {
  const since = new Date(Date.now() - minutes * 60_000)
  const rows = await db
    .select({ n: sql<number>`count(*)` })
    .from(nodes)
    .where(and(eq(nodes.ipHash, hash), gte(nodes.createdAt, since)))
  return Number(rows[0]?.n ?? 0)
}

export const RATE_LIMIT = { windowMinutes: 60, max: 10 } // max submissions / ip / hour
