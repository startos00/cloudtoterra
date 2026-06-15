import { describe, it, expect } from 'vitest'
import {
  ipHash, isHoneypotTripped, recentCountForIp,
  clientIp, isLoginThrottled, recordFailedLogin, LOGIN_LIMIT,
} from './abuse'
import { makeTestDb } from '@/test/pg'
import { nodes } from '@/lib/schema'

describe('abuse', () => {
  it('hashes ip deterministically + salted', () => {
    expect(ipHash('1.2.3.4')).toBe(ipHash('1.2.3.4'))
    expect(ipHash('1.2.3.4')).not.toBe('1.2.3.4')
  })
  it('detects honeypot', () => {
    expect(isHoneypotTripped({ website: 'http://spam' })).toBe(true)
    expect(isHoneypotTripped({ website: '' })).toBe(false)
    expect(isHoneypotTripped({})).toBe(false)
  })
  it('counts recent submissions per ip', async () => {
    const { db } = await makeTestDb()
    const h = ipHash('9.9.9.9')
    await db.insert(nodes).values({
      type: 'building', subType: 'commercial_office', nodeName: 'x', latitude: 1, longitude: 1, ipHash: h,
    })
    expect(await recentCountForIp(db, h, 60)).toBe(1)
    expect(await recentCountForIp(db, ipHash('0.0.0.0'), 60)).toBe(0)
  })

  it('clientIp prefers x-real-ip, then left-most XFF, then fallback', () => {
    expect(clientIp(new Request('http://x', { headers: { 'x-real-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' } }))).toBe('1.1.1.1')
    expect(clientIp(new Request('http://x', { headers: { 'x-forwarded-for': '2.2.2.2, 3.3.3.3' } }))).toBe('2.2.2.2')
    expect(clientIp(new Request('http://x'))).toBe('0.0.0.0')
  })

  it('login throttle trips after max failed attempts and resets after the window', () => {
    const key = 'throttle-unit-key'
    const now = 1_000_000
    expect(isLoginThrottled(key, now)).toBe(false)
    for (let i = 0; i < LOGIN_LIMIT.max; i++) recordFailedLogin(key, now)
    expect(isLoginThrottled(key, now)).toBe(true)
    expect(isLoginThrottled(key, now + LOGIN_LIMIT.windowMinutes * 60_000 + 1)).toBe(false)
  })
})
