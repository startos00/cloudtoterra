import { describe, it, expect } from 'vitest'
import { overpassQuery, parseOverpass, anchorsFeatureCollection } from './anchors'

describe('overpassQuery', () => {
  it('embeds the bbox and asks for centers + tags', () => {
    const q = overpassQuery({ south: 42.8, west: -78.9, north: 42.9, east: -78.8 })
    expect(q).toContain('42.8,-78.9,42.9,-78.8')
    expect(q).toContain('"amenity"="hospital"')
    expect(q).toContain('"amenity"="university"')
    expect(q).toContain('"railway"="station"')
    expect(q).toContain('out center tags;')
  })
})

describe('parseOverpass', () => {
  const fixture = {
    elements: [
      { type: 'node', id: 1, lat: 42.88, lon: -78.87, tags: { amenity: 'hospital', name: 'General Hospital' } },
      { type: 'way', id: 2, center: { lat: 42.89, lon: -78.86 }, tags: { amenity: 'university', name: 'State University' } },
      { type: 'node', id: 3, lat: 42.9, lon: -78.85, tags: { railway: 'station' } }, // no name → falls back to kind
      { type: 'node', id: 4, lat: 42.91, lon: -78.84, tags: { shop: 'bakery' } }, // irrelevant → skipped
      { type: 'way', id: 5, tags: { amenity: 'hospital', name: 'No Coords' } }, // no coords → skipped
    ],
  }

  it('keeps only relevant kinds with coordinates', () => {
    const anchors = parseOverpass(fixture as never)
    expect(anchors).toHaveLength(3)
    expect(anchors.map((a) => a.kind)).toEqual(['hospital', 'university', 'station'])
    expect(anchors[1].lat).toBe(42.89) // way center used
    expect(anchors[2].name).toBe('station') // name fallback
  })

  it('handles empty/missing elements', () => {
    expect(parseOverpass({})).toEqual([])
  })

  it('builds a GeoJSON FC with lng,lat order', () => {
    const fc = anchorsFeatureCollection(parseOverpass(fixture as never))
    expect(fc.type).toBe('FeatureCollection')
    expect(fc.features[0].geometry.coordinates).toEqual([-78.87, 42.88])
    expect(fc.features[0].properties.kind).toBe('hospital')
  })
})
