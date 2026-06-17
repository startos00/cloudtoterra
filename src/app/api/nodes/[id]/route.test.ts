import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeTestDb } from '@/test/pg'
import { createNode } from '@/lib/nodes'
import { makeToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import type { Db } from '@/lib/db'

let testDb: Db
vi.mock('@/lib/db', () => ({ get db() { return testDb } }))

beforeEach(async () => {
  testDb = (await makeTestDb()).db
  process.env.ADMIN_SESSION_SECRET = 's'
})

function adminReq(url: string, init: RequestInit = {}) {
  return new Request(url, {
    ...init,
    headers: { ...(init.headers || {}), cookie: `${ADMIN_COOKIE}=${makeToken('s')}` },
  })
}

describe('PATCH /api/nodes/[id]', () => {
  it('admin can approve (sets visible)', async () => {
    const n = await createNode(testDb, {
      type: 'building', subType: 'commercial_office', nodeName: 'M', latitude: 1, longitude: 1,
    })
    const { PATCH } = await import('./route')
    const res = await PATCH(
      adminReq(`http://x/api/nodes/${n.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) }),
      { params: Promise.resolve({ id: n.id }) },
    )
    expect(res.status).toBe(200)
    expect((await res.json()).data.isVisible).toBe(true)
  })

  it('admin can attach a 3D model + feature on approve', async () => {
    const n = await createNode(testDb, {
      type: 'building', subType: 'commercial_office', nodeName: 'M', latitude: 1, longitude: 1,
    })
    const { PATCH } = await import('./route')
    const res = await PATCH(
      adminReq(`http://x/api/nodes/${n.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved', model3dUrl: 'https://blob.example/m.glb', featured: true }),
      }),
      { params: Promise.resolve({ id: n.id }) },
    )
    expect(res.status).toBe(200)
    const data = (await res.json()).data
    expect(data.model3dUrl).toBe('https://blob.example/m.glb')
    expect(data.featured).toBe(true)
    expect(data.isVisible).toBe(true)
  })

  it('non-admin is 401', async () => {
    const n = await createNode(testDb, {
      type: 'building', subType: 'commercial_office', nodeName: 'M', latitude: 1, longitude: 1,
    })
    const { PATCH } = await import('./route')
    const res = await PATCH(
      new Request(`http://x/api/nodes/${n.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) }),
      { params: Promise.resolve({ id: n.id }) },
    )
    expect(res.status).toBe(401)
  })

  it('GET hides a pending node (404)', async () => {
    const n = await createNode(testDb, {
      type: 'building', subType: 'commercial_office', nodeName: 'M', latitude: 1, longitude: 1,
    })
    const { GET } = await import('./route')
    const res = await GET(new Request(`http://x/api/nodes/${n.id}`), { params: Promise.resolve({ id: n.id }) })
    expect(res.status).toBe(404)
  })
})
