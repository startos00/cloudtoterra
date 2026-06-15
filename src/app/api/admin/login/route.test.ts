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
})
