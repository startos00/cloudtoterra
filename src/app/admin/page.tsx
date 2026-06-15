import { cookies } from 'next/headers'
import { verifyToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { listAll } from '@/lib/nodes'
import { AdminLogin } from '@/components/AdminLogin'
import { AdminQueue } from '@/components/AdminQueue'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const secret = process.env.ADMIN_SESSION_SECRET ?? ''
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  const ok = !!token && !!secret && verifyToken(token, secret)

  if (!ok) return <AdminLogin />

  const pending = await listAll(db, { status: 'pending' })
  // NodeRow → AdminQueue Item (structurally compatible subset)
  return <AdminQueue initial={pending as unknown as Parameters<typeof AdminQueue>[0]['initial']} />
}
