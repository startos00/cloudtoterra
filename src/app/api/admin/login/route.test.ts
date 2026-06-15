import { describe, it, expect, beforeEach } from 'vitest'

beforeEach(() => {
  process.env.ADMIN_PASSWORD = 'pw'
  process.env.ADMIN_SESSION_SECRET = 's'
})

describe('POST /api/admin/login', () => {
  it('sets cookie on correct password', async () => {
    const { POST } = await import('./route')
    const res = await POST(new Request('http://x', { method: 'POST', body: JSON.stringify({ password: 'pw' }) }))
    expect(res.status).toBe(200)
    expect(res.headers.get('set-cookie')).toContain('ctt_admin=')
  })

  it('401 on wrong password', async () => {
    const { POST } = await import('./route')
    const res = await POST(new Request('http://x', { method: 'POST', body: JSON.stringify({ password: 'nope' }) }))
    expect(res.status).toBe(401)
  })

  it('429 after too many failed attempts from one IP', async () => {
    const { POST } = await import('./route')
    const headers = { 'x-forwarded-for': '203.0.113.9' }
    for (let i = 0; i < 8; i++) {
      const r = await POST(new Request('http://x', { method: 'POST', headers, body: JSON.stringify({ password: 'wrong' }) }))
      expect(r.status).toBe(401)
    }
    const r9 = await POST(new Request('http://x', { method: 'POST', headers, body: JSON.stringify({ password: 'wrong' }) }))
    expect(r9.status).toBe(429)
  })

  it('500 when ADMIN_SESSION_SECRET is unset (fails closed)', async () => {
    delete process.env.ADMIN_SESSION_SECRET
    const { POST } = await import('./route')
    const res = await POST(new Request('http://x', { method: 'POST', body: JSON.stringify({ password: 'pw' }) }))
    expect(res.status).toBe(500)
  })
})
