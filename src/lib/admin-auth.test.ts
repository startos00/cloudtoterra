import { describe, it, expect } from 'vitest'
import { makeToken, verifyToken } from './admin-auth'

describe('admin-auth', () => {
  it('round-trips a valid token', () => {
    const t = makeToken('s3cret')
    expect(verifyToken(t, 's3cret')).toBe(true)
  })
  it('rejects tampered / wrong-secret token', () => {
    const t = makeToken('s3cret')
    expect(verifyToken(t + 'x', 's3cret')).toBe(false)
    expect(verifyToken(t, 'other')).toBe(false)
  })
})
