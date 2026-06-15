import { describe, it, expect } from 'vitest'
import { makeTestDb } from '@/test/pg'
import { createNode, listVisible, listAll, getNode, setStatus } from './nodes'

const sub = {
  type: 'building' as const, subType: 'commercial_office',
  nodeName: 'Mill', latitude: 42.8, longitude: -78.8,
}

describe('nodes data-access', () => {
  it('creates pending+hidden, excluded from public list', async () => {
    const { db } = await makeTestDb()
    const n = await createNode(db, { ...sub, ipHash: 'h' })
    expect(n.status).toBe('pending')
    expect(n.isVisible).toBe(false)
    expect(await listVisible(db, {})).toHaveLength(0)
    expect(await listAll(db, {})).toHaveLength(1)
  })
  it('approve makes it visible', async () => {
    const { db } = await makeTestDb()
    const n = await createNode(db, { ...sub, ipHash: 'h' })
    await setStatus(db, n.id, 'approved')
    const got = await getNode(db, n.id)
    expect(got?.isVisible).toBe(true)
    expect(await listVisible(db, {})).toHaveLength(1)
  })
  it('filters visible by type', async () => {
    const { db } = await makeTestDb()
    const a = await createNode(db, { ...sub })
    await setStatus(db, a.id, 'approved')
    expect(await listVisible(db, { type: 'land' })).toHaveLength(0)
    expect(await listVisible(db, { type: 'building' })).toHaveLength(1)
  })
})
