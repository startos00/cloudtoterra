import { NextResponse } from 'next/server'
import { overpassQuery, parseOverpass, anchorsFeatureCollection, type Bbox } from '@/lib/anchors'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// Institutional anchors for a bbox, from OSM Overpass. Cached a day (anchors rarely move).
export const revalidate = 86400

export async function GET(req: Request) {
  const u = new URL(req.url)
  const parts = ['south', 'west', 'north', 'east'].map((k) => Number(u.searchParams.get(k)))
  if (parts.some((n) => Number.isNaN(n))) {
    return NextResponse.json({ data: null, error: 'bbox_required' }, { status: 400 })
  }
  const [south, west, north, east] = parts
  const bbox: Bbox = { south, west, north, east }
  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: overpassQuery(bbox),
      next: { revalidate },
    })
    if (!res.ok) return NextResponse.json({ data: null, error: 'overpass_failed' }, { status: 502 })
    const json = await res.json()
    return NextResponse.json({ data: anchorsFeatureCollection(parseOverpass(json)), error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'overpass_failed' }, { status: 502 })
  }
}
