import { describe, it, expect } from 'vitest'
import { ipHash, isHoneypotTripped, recentCountForIp } from './abuse'
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
})
