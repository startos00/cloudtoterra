import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeTestDb } from '@/test/pg'
import { createNode, setStatus } from '@/lib/nodes'
import type { Db } from '@/lib/db'

let testDb: Db
vi.mock('@/lib/db', () => ({ get db() { return testDb } }))
beforeEach(async () => { testDb = (await makeTestDb()).db })

describe('GET /api/overlays/density', () => {
  it('returns weighted points for visible nodes only', async () => {
    const a = await createNode(testDb, {
      type: 'building', subType: 'commercial_office', condition: 'derelict', nodeName: 'A', latitude: 1, longitude: 2,
    })
    await setStatus(testDb, a.id, 'approved')
    await createNode(testDb, {
      type: 'building', subType: 'commercial_office', condition: 'derelict', nodeName: 'B', latitude: 3, longitude: 4,
    }) // pending → excluded

    const { GET } = await import('./route')
    const res = await GET()
    const j = await res.json()
    expect(res.status).toBe(200)
    expect(j.data.features).toHaveLength(1)
    expect(j.data.features[0].properties.weight).toBe(1)
    expect(j.data.features[0].geometry.coordinates).toEqual([2, 1])
  })
})
