import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getNode, setStatus, updateCuration } from '@/lib/nodes'
import { verifyToken, ADMIN_COOKIE } from '@/lib/admin-auth'

async function isAdmin(req: Request): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET ?? ''
  if (!secret) return false
  // Prefer cookie from the request header (works in route tests + runtime)…
  const fromHeader = req.headers.get('cookie')?.match(new RegExp(`${ADMIN_COOKIE}=([^;]+)`))?.[1]
  let token = fromHeader
  if (!token) {
    // …fall back to Next's request-scoped cookies(); guarded for non-request scopes.
    try {
      token = (await cookies()).get(ADMIN_COOKIE)?.value
    } catch {
      token = undefined
    }
  }
  return !!token && verifyToken(token, secret)
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = await getNode(db, id)
  // Public detail hides anything not approved/visible.
  if (!row || !row.isVisible) {
    return NextResponse.json({ data: null, error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json({ data: row, error: null })
}

const patchSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
  // optional admin curation applied alongside the status change
  model3dUrl: z.string().url().nullable().optional(),
  featured: z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ data: null, error: 'unauthorised' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: 'invalid' }, { status: 400 })
  }
  const { status, model3dUrl, featured } = parsed.data
  if (model3dUrl !== undefined || featured !== undefined) {
    await updateCuration(db, id, { model3dUrl, featured })
  }
  await setStatus(db, id, status)
  const row = await getNode(db, id)
  return NextResponse.json({ data: row, error: null })
}
