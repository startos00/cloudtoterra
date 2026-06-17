import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeTestDb } from '@/test/pg'
import { createNode, getNode } from '@/lib/nodes'
import { makeToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import type { Db } from '@/lib/db'

let testDb: Db
vi.mock('@/lib/db', () => ({ get db() { return testDb } }))

beforeEach(async () => {
  testDb = (await makeTestDb()).db
  process.env.ADMIN_SESSION_SECRET = 's'
  delete process.env.ANTHROPIC_API_KEY // force the deterministic generator
})

function adminReq(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    headers: { cookie: `${ADMIN_COOKIE}=${makeToken('s')}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/generate-model', () => {
  it('admin generates a draft massing (saved as draft)', async () => {
    const n = await createNode(testDb, {
      type: 'building', subType: 'commercial_industrial_mill', nodeName: 'Mill',
      description: 'A four-storey mill with a chimney.', latitude: 1, longitude: 1,
    })
    const { POST } = await import('./route')
    const res = await POST(adminReq('http://x/api/generate-model', { id: n.id }))
    expect(res.status).toBe(201)
    const { data } = await res.json()
    expect(data.engine).toBe('deterministic')
    expect(data.spec.elements.length).toBeGreaterThan(0)
    const row = await getNode(testDb, n.id)
    expect(row?.modelStatus).toBe('draft')
    expect(row?.modelSpec).toBeTruthy()
  })

  it('non-admin is 401', async () => {
    const n = await createNode(testDb, {
      type: 'building', subType: 'commercial_office', nodeName: 'M', latitude: 1, longitude: 1,
    })
    const { POST } = await import('./route')
    const res = await POST(
      new Request('http://x/api/generate-model', { method: 'POST', body: JSON.stringify({ id: n.id }) }),
    )
    expect(res.status).toBe(401)
  })
})
