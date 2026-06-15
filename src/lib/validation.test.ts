import { describe, it, expect } from 'vitest'
import { submissionSchema } from './validation'

const base = {
  type: 'building', subType: 'commercial_office', condition: 'dormant',
  nodeName: 'Old Mill', latitude: 42.88, longitude: -78.87,
}

describe('submissionSchema', () => {
  it('accepts a valid building', () => {
    expect(submissionSchema.safeParse(base).success).toBe(true)
  })
  it('rejects sub_type that does not match type', () => {
    expect(submissionSchema.safeParse({ ...base, subType: 'brownfield' }).success).toBe(false)
  })
  it('requires a boundary for land', () => {
    const land = { type: 'land', subType: 'brownfield', nodeName: 'Lot', latitude: 1, longitude: 1 }
    expect(submissionSchema.safeParse(land).success).toBe(false)
    expect(submissionSchema.safeParse({
      ...land, boundary: { type: 'Polygon', coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]] },
    }).success).toBe(true)
  })
  it('rejects out-of-range coordinates', () => {
    expect(submissionSchema.safeParse({ ...base, latitude: 999 }).success).toBe(false)
  })
  it('rejects non-http(s) photo url schemes', () => {
    expect(submissionSchema.safeParse({ ...base, photoUrls: ['javascript:alert(1)'] }).success).toBe(false)
    expect(submissionSchema.safeParse({ ...base, photoUrls: ['data:text/html,x'] }).success).toBe(false)
    expect(submissionSchema.safeParse({ ...base, photoUrls: ['https://example.com/a.jpg'] }).success).toBe(true)
  })
})
