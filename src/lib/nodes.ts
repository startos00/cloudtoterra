import { and, desc, eq } from 'drizzle-orm'
import { nodes, type NewNode, type NodeRow } from './schema'
import type { Db } from './db'

export type ListFilters = { type?: string; subType?: string; condition?: string }

export async function createNode(db: Db, input: NewNode): Promise<NodeRow> {
  const [row] = await db
    .insert(nodes)
    .values({ ...input, status: 'pending', isVisible: false })
    .returning()
  return row
}

export async function getNode(db: Db, id: string): Promise<NodeRow | undefined> {
  const [row] = await db.select().from(nodes).where(eq(nodes.id, id)).limit(1)
  return row
}

function applyFilters(filters: ListFilters) {
  const conds = []
  if (filters.type) conds.push(eq(nodes.type, filters.type))
  if (filters.subType) conds.push(eq(nodes.subType, filters.subType))
  if (filters.condition) conds.push(eq(nodes.condition, filters.condition))
  return conds
}

export async function listVisible(db: Db, filters: ListFilters): Promise<NodeRow[]> {
  return db
    .select()
    .from(nodes)
    .where(and(eq(nodes.isVisible, true), ...applyFilters(filters)))
    .orderBy(desc(nodes.createdAt))
}

export async function listAll(
  db: Db,
  filters: ListFilters & { status?: string },
): Promise<NodeRow[]> {
  const conds = applyFilters(filters)
  if (filters.status) conds.push(eq(nodes.status, filters.status))
  return db
    .select()
    .from(nodes)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(nodes.createdAt))
}

export async function setStatus(
  db: Db,
  id: string,
  status: 'approved' | 'rejected' | 'pending',
): Promise<void> {
  await db
    .update(nodes)
    .set({
      status,
      isVisible: status === 'approved',
      approvedAt: status === 'approved' ? new Date() : null,
    })
    .where(eq(nodes.id, id))
}
