// Institutional-anchors overlay via OpenStreetMap Overpass API.
// Best-judgment default source for P2 (free, no key, no account) — flagged for review.
// Pure query-build + parse here (offline-testable); the live fetch lives in the route.

export type AnchorKind = 'hospital' | 'university' | 'station'
export type Anchor = { id: string; kind: AnchorKind; name: string; lat: number; lng: number }
export type Bbox = { south: number; west: number; north: number; east: number }

export function overpassQuery(b: Bbox): string {
  const bbox = `${b.south},${b.west},${b.north},${b.east}`
  return `[out:json][timeout:25];(` +
    `node["amenity"="hospital"](${bbox});` +
    `way["amenity"="hospital"](${bbox});` +
    `node["amenity"="university"](${bbox});` +
    `way["amenity"="university"](${bbox});` +
    `node["railway"="station"](${bbox});` +
    `);out center tags;`
}

type OverpassEl = {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

function kindOf(tags: Record<string, string>): AnchorKind | null {
  if (tags.amenity === 'hospital') return 'hospital'
  if (tags.amenity === 'university') return 'university'
  if (tags.railway === 'station') return 'station'
  return null
}

export function parseOverpass(json: { elements?: OverpassEl[] }): Anchor[] {
  const out: Anchor[] = []
  for (const el of json.elements ?? []) {
    const tags = el.tags ?? {}
    const kind = kindOf(tags)
    if (!kind) continue
    const lat = el.lat ?? el.center?.lat
    const lng = el.lon ?? el.center?.lon
    if (lat == null || lng == null) continue
    out.push({ id: `${el.type}/${el.id}`, kind, name: tags.name ?? kind, lat, lng })
  }
  return out
}

export type AnchorsFC = {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: { type: 'Point'; coordinates: [number, number] }
    properties: { kind: AnchorKind; name: string }
  }>
}

export function anchorsFeatureCollection(anchors: Anchor[]): AnchorsFC {
  return {
    type: 'FeatureCollection',
    features: anchors.map((a) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [a.lng, a.lat] },
      properties: { kind: a.kind, name: a.name },
    })),
  }
}
