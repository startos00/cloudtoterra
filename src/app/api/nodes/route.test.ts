import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeTestDb } from '@/test/pg'
import type { Db } from '@/lib/db'

let testDb: Db
vi.mock('@/lib/db', () => ({ get db() { return testDb } }))

beforeEach(async () => {
  testDb = (await makeTestDb()).db
})

describe('POST /api/nodes', () => {
  it('creates a pending node and hides it from GET', async () => {
    const { POST, GET } = await import('./route')
    const body = {
      type: 'building', subType: 'commercial_office', condition: 'dormant',
      nodeName: 'Mill', latitude: 42.8, longitude: -78.8,
    }
    const res = await POST(new Request('http://x/api/nodes', {
      method: 'POST', body: JSON.stringify(body), headers: { 'x-forwarded-for': '5.5.5.5' },
    }))
    const json = await res.json()
    expect(res.status).toBe(201)
    expect(json.data.status).toBe('pending')

    const list = await (await GET(new Request('http://x/api/nodes'))).json()
    expect(list.data).toHaveLength(0) // hidden until approved
  })

  it('rejects honeypot', async () => {
    const { POST } = await import('./route')
    const res = await POST(new Request('http://x/api/nodes', {
      method: 'POST',
      body: JSON.stringify({
        type: 'building', subType: 'commercial_office', nodeName: 'x',
        latitude: 1, longitude: 1, website: 'spam',
      }),
    }))
    expect(res.status).toBe(400)
  })

  it('rejects sub_type that does not match type', async () => {
    const { POST } = await import('./route')
    const res = await POST(new Request('http://x/api/nodes', {
      method: 'POST',
      body: JSON.stringify({
        type: 'land', subType: 'commercial_office', nodeName: 'x',
        latitude: 1, longitude: 1, boundary: {},
      }),
    }))
    expect(res.status).toBe(400)
  })

  it('rate-limits a single IP after the window max', async () => {
    const { POST } = await import('./route')
    const body = { type: 'building', subType: 'commercial_office', nodeName: 'Mill', latitude: 1, longitude: 1 }
    const headers = { 'x-forwarded-for': '7.7.7.7' }
    for (let i = 0; i < 10; i++) {
      const r = await POST(new Request('http://x/api/nodes', { method: 'POST', body: JSON.stringify(body), headers }))
      expect(r.status).toBe(201)
    }
    const over = await POST(new Request('http://x/api/nodes', { method: 'POST', body: JSON.stringify(body), headers }))
    expect(over.status).toBe(429)
  })
})
