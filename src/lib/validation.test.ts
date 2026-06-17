import { describe, it, expect } from 'vitest'
import { submissionSchema, isAcceptablePhoto, PHOTO_MAX_LEN } from './validation'

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
  it('accepts device-uploaded base64 images', () => {
    const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
    const jpg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ=='
    expect(submissionSchema.safeParse({ ...base, photoUrls: [png, jpg] }).success).toBe(true)
  })
  it('caps the number of photos at 6', () => {
    const one = 'https://example.com/a.jpg'
    expect(submissionSchema.safeParse({ ...base, photoUrls: Array(7).fill(one) }).success).toBe(false)
  })
})

describe('isAcceptablePhoto', () => {
  it('accepts http(s) and base64 image data urls', () => {
    expect(isAcceptablePhoto('https://example.com/a.jpg')).toBe(true)
    expect(isAcceptablePhoto('data:image/webp;base64,AAAA')).toBe(true)
  })
  it('rejects non-image data urls and bad schemes', () => {
    expect(isAcceptablePhoto('data:text/html,x')).toBe(false)
    expect(isAcceptablePhoto('javascript:alert(1)')).toBe(false)
    expect(isAcceptablePhoto('not a url')).toBe(false)
  })
  it('rejects oversized inline images', () => {
    const huge = 'data:image/png;base64,' + 'A'.repeat(PHOTO_MAX_LEN)
    expect(isAcceptablePhoto(huge)).toBe(false)
  })
})
