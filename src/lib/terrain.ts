import type { Element } from './model-spec'

type Ring = [number, number][]

// Build a parcel-topography element from a GeoJSON polygon boundary: sample real
// elevation across the bounding box (Open-Meteo, no key), normalise the relief, and
// return a heightfield grid + footprint ring in model space. Returns null on failure
// (caller falls back to a flat slab).
export async function terrainElement(boundary: unknown): Promise<Element | null> {
  const ring = (boundary as { coordinates?: Ring[] } | null)?.coordinates?.[0]
  if (!ring || ring.length < 4) return null

  const lngs = ring.map((p) => p[0])
  const lats = ring.map((p) => p[1])
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  if (!isFinite(minLng) || maxLng === minLng || maxLat === minLat) return null

  const N = 10 // 10×10 = 100 sample points (Open-Meteo's per-request max)
  const gLat: number[] = [], gLng: number[] = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      gLat.push(minLat + ((maxLat - minLat) * r) / (N - 1))
      gLng.push(minLng + ((maxLng - minLng) * c) / (N - 1))
    }
  }

  let elev: number[]
  try {
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${gLat.join(',')}&longitude=${gLng.join(',')}`
    const res = await fetch(url)
    if (!res.ok) return null
    const j = (await res.json()) as { elevation?: number[] }
    if (!Array.isArray(j.elevation) || j.elevation.length !== N * N) return null
    elev = j.elevation
  } catch {
    return null
  }

  // model-space transform: centre, scale longest side to ~6 units, compress longitude by latitude
  const span = Math.max(maxLng - minLng, maxLat - minLat)
  const scale = 6 / span
  const kx = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180)) || 1
  const cx = (minLng + maxLng) / 2, cz = (minLat + maxLat) / 2
  const toX = (lng: number) => (lng - cx) * scale * kx
  const toZ = (lat: number) => (lat - cz) * scale

  const minE = Math.min(...elev), maxE = Math.max(...elev)
  const relief = maxE - minE
  const V_UNITS = 1.4 // normalised vertical exaggeration so micro-relief is visible

  const points: [number, number, number][] = []
  for (let i = 0; i < N * N; i++) {
    const y = relief > 1e-6 ? ((elev[i] - minE) / relief) * V_UNITS : 0
    points.push([toX(gLng[i]), Number(y.toFixed(4)), toZ(gLat[i])])
  }
  const ringModel: [number, number][] = ring.map(([lng, lat]) => [
    Number(toX(lng).toFixed(4)),
    Number(toZ(lat).toFixed(4)),
  ])

  return { kind: 'terrain', cols: N, rows: N, points, ring: ringModel, color: '#7d7f73' }
}
