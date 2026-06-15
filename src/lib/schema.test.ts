import { describe, it, expect } from 'vitest'
import { nodes } from './schema'

describe('schema', () => {
  it('nodes table exposes required columns', () => {
    const cols = Object.keys(nodes)
    for (const c of [
      'id', 'type', 'subType', 'condition', 'nodeName',
      'latitude', 'longitude', 'boundary', 'status', 'isVisible', 'ipHash', 'createdAt',
    ]) {
      expect(cols).toContain(c)
    }
  })
})
