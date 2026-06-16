import { describe, it, expect } from 'vitest'
import { densityFeatureCollection, CONDITION_WEIGHT, DEFAULT_WEIGHT } from './overlays'

describe('densityFeatureCollection', () => {
  it('maps nodes to weighted points by condition (lng,lat order)', () => {
    const fc = densityFeatureCollection([
      { latitude: 1, longitude: 2, condition: 'derelict' },
      { latitude: 3, longitude: 4, condition: 'usable' },
      { latitude: 5, longitude: 6, condition: null },
    ])
    expect(fc.type).toBe('FeatureCollection')
    expect(fc.features).toHaveLength(3)
    expect(fc.features[0].geometry.coordinates).toEqual([2, 1])
    expect(fc.features[0].properties.weight).toBe(CONDITION_WEIGHT.derelict)
    expect(fc.features[1].properties.weight).toBe(CONDITION_WEIGHT.usable)
    expect(fc.features[2].properties.weight).toBe(DEFAULT_WEIGHT)
  })
  it('handles empty input', () => {
    expect(densityFeatureCollection([]).features).toHaveLength(0)
  })
})
