'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { NODE_TYPES, type NodeType } from '@/lib/taxonomy'
import { TYPE_COLORS, TYPE_LABELS, TYPE_EMOJI, type PublicNode } from '@/lib/ui'
import { SubmissionModal } from './SubmissionModal'
import { FilterPanel, type Filters } from './FilterPanel'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const renderGenRef = useRef(0)

  const [filters, setFilters] = useState<Filters>({ types: [...NODE_TYPES], condition: '' })
  const [addType, setAddType] = useState<NodeType | null>(null)
  const [draft, setDraft] = useState<{ type: NodeType; lat: number; lng: number; boundary?: unknown } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [count, setCount] = useState(0)
  const [missingToken] = useState(!TOKEN)
  const [showDensity, setShowDensity] = useState(false)
  const [showAnchors, setShowAnchors] = useState(false)

  const fetchNodes = useCallback(async (): Promise<PublicNode[]> => {
    const p = new URLSearchParams()
    if (filters.condition) p.set('condition', filters.condition)
    const res = await fetch(`/api/nodes?${p.toString()}`)
    if (!res.ok) throw new Error(`list failed: ${res.status}`)
    const j = await res.json()
    const all: PublicNode[] = j.data ?? []
    return all.filter((n) => filters.types.includes(n.type))
  }, [filters])

  const renderMarkers = useCallback(async () => {
    const map = mapRef.current
    if (!map) return
    const gen = ++renderGenRef.current
    setStatus('loading')
    let nodes: PublicNode[]
    try {
      nodes = await fetchNodes()
    } catch {
      if (gen === renderGenRef.current) setStatus('error')
      return
    }
    if (gen !== renderGenRef.current) return // a newer render started; abandon
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    for (const n of nodes) {
      const el = document.createElement('button')
      el.type = 'button'
      el.setAttribute('aria-label', `${TYPE_LABELS[n.type]}: ${n.nodeName}`)
      el.textContent = TYPE_EMOJI[n.type] // glyph so type isn't conveyed by colour alone
      el.style.cssText =
        `display:grid;place-items:center;width:24px;height:24px;border-radius:50%;border:2px solid var(--color-paper);` +
        `box-shadow:0 1px 5px oklch(0.255 0.018 55 / 0.45);cursor:pointer;font-size:12px;line-height:1;padding:0;background:${TYPE_COLORS[n.type]}`
      const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(
        `<strong>${escapeHtml(n.nodeName)}</strong><br/>${escapeHtml(TYPE_LABELS[n.type])} · ${escapeHtml(n.subType)}` +
          `${n.condition ? ` · ${escapeHtml(n.condition)}` : ''}<br/><a href="/node/${encodeURIComponent(n.id)}">View →</a>`,
      )
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([n.longitude, n.latitude]).setPopup(popup).addTo(map)
      markersRef.current.push(marker)
    }
    setCount(nodes.length)
    setStatus('ok')
  }, [fetchNodes])

  // init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return
    mapboxgl.accessToken = TOKEN
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-78.87, 42.88],
      zoom: 4,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // render (and re-render on filter change) — self-gates on map readiness
  useEffect(() => { void renderMarkers() }, [renderMarkers])

  // add-mode wiring
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    function cleanupDraw() {
      if (drawRef.current) { map!.removeControl(drawRef.current); drawRef.current = null }
    }
    function onClick(e: mapboxgl.MapMouseEvent) {
      if (!addType || addType === 'land') return
      setDraft({ type: addType, lat: e.lngLat.lat, lng: e.lngLat.lng })
      setAddType(null)
    }
    function onDrawCreate(e: { features: GeoJSON.Feature[] }) {
      const poly = e.features[0]
      if (!poly || poly.geometry.type !== 'Polygon') return
      const ring = poly.geometry.coordinates[0] as [number, number][]
      const c = centroid(ring)
      setDraft({ type: 'land', lat: c[1], lng: c[0], boundary: poly.geometry })
      setAddType(null)
      cleanupDraw()
    }

    if (addType === 'land') {
      const draw = new MapboxDraw({ displayControlsDefault: false, controls: { polygon: true, trash: true }, defaultMode: 'draw_polygon' })
      drawRef.current = draw
      map.addControl(draw)
      map.on('draw.create', onDrawCreate)
    }
    map.on('click', onClick)
    return () => {
      map.off('click', onClick)
      map.off('draw.create', onDrawCreate)
      cleanupDraw()
    }
  }, [addType])

  // distress-density heatmap overlay (self-derived from approved nodes)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    let cancelled = false
    const SRC = 'ctt-density'
    const LAYER = 'ctt-density-heat'

    function removeLayer() {
      const m = mapRef.current
      if (!m) return
      if (m.getLayer(LAYER)) m.removeLayer(LAYER)
      if (m.getSource(SRC)) m.removeSource(SRC)
    }

    async function add() {
      let data: GeoJSON.FeatureCollection
      try {
        const res = await fetch('/api/overlays/density')
        if (!res.ok) return
        data = (await res.json()).data
      } catch {
        return
      }
      const m = mapRef.current
      if (cancelled || !m) return
      const apply = () => {
        const mm = mapRef.current
        if (cancelled || !mm) return
        const existing = mm.getSource(SRC) as mapboxgl.GeoJSONSource | undefined
        if (existing) {
          existing.setData(data)
          return
        }
        mm.addSource(SRC, { type: 'geojson', data })
        mm.addLayer({
          id: LAYER,
          type: 'heatmap',
          source: SRC,
          paint: {
            'heatmap-weight': ['get', 'weight'],
            'heatmap-intensity': 1,
            'heatmap-radius': 28,
            'heatmap-opacity': 0.65,
          },
        })
      }
      if (m.isStyleLoaded()) apply()
      else m.once('load', apply)
    }

    if (showDensity) void add()
    else removeLayer()
    return () => { cancelled = true }
  }, [showDensity])

  // institutional-anchors overlay (OSM Overpass; fetched for the current viewport)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    let cancelled = false
    const SRC = 'ctt-anchors'
    const LAYER = 'ctt-anchors-pts'

    function removeAll() {
      const m = mapRef.current
      if (!m) return
      if (m.getLayer(LAYER)) m.removeLayer(LAYER)
      if (m.getSource(SRC)) m.removeSource(SRC)
    }
    function onAnchorClick(e: mapboxgl.MapLayerMouseEvent) {
      const m = mapRef.current
      const f = e.features?.[0]
      if (!m || !f) return
      new mapboxgl.Popup({ offset: 10 })
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${escapeHtml(String(f.properties?.name ?? ''))}</strong><br/>${escapeHtml(String(f.properties?.kind ?? ''))}`)
        .addTo(m)
    }
    async function load() {
      const m = mapRef.current
      const b = m?.getBounds()
      if (!m || !b) return
      const params = new URLSearchParams({
        south: String(b.getSouth()), west: String(b.getWest()),
        north: String(b.getNorth()), east: String(b.getEast()),
      })
      let data: GeoJSON.FeatureCollection
      try {
        const res = await fetch(`/api/overlays/anchors?${params.toString()}`)
        if (!res.ok) return
        data = (await res.json()).data
      } catch {
        return
      }
      const mm = mapRef.current
      if (cancelled || !mm || !data) return
      const apply = () => {
        const m2 = mapRef.current
        if (cancelled || !m2) return
        const existing = m2.getSource(SRC) as mapboxgl.GeoJSONSource | undefined
        if (existing) { existing.setData(data); return }
        m2.addSource(SRC, { type: 'geojson', data })
        m2.addLayer({
          id: LAYER,
          type: 'circle',
          source: SRC,
          paint: {
            'circle-radius': 6,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
            'circle-color': ['match', ['get', 'kind'], 'hospital', '#dc2626', 'university', '#2563eb', 'station', '#059669', '#6b7280'],
          },
        })
      }
      if (mm.isStyleLoaded()) apply()
      else mm.once('load', apply)
    }
    function onMoveEnd() { void load() }

    if (showAnchors) {
      void load()
      map.on('moveend', onMoveEnd)
      map.on('click', LAYER, onAnchorClick)
    } else {
      removeAll()
    }
    return () => {
      cancelled = true
      map.off('moveend', onMoveEnd)
      map.off('click', LAYER, onAnchorClick)
    }
  }, [showAnchors])

  if (missingToken) {
    return (
      <div className="grid h-full place-items-center p-8 text-center text-sm text-ink-2">
        <div>
          <p className="font-semibold">Map needs a Mapbox token.</p>
          <p className="mt-1">Set <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> in <code>.env.local</code> and reload.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute left-3 top-3 z-10 w-44 space-y-2">
        <FilterPanel filters={filters} onChange={setFilters} />
        <div className="rounded border border-line bg-paper/95 p-2 shadow-sm backdrop-blur">
          <div className="label">Overlays</div>
          <button
            onClick={() => setShowDensity((v) => !v)}
            aria-pressed={showDensity}
            className="mt-1.5 flex w-full items-center gap-2 text-left text-sm text-ink"
          >
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: showDensity ? 'var(--color-ember)' : 'var(--color-line-strong)' }} />
            Distress density
          </button>
          <button
            onClick={() => setShowAnchors((v) => !v)}
            aria-pressed={showAnchors}
            className="mt-1.5 flex w-full items-center gap-2 text-left text-sm text-ink"
          >
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: showAnchors ? 'var(--color-civic)' : 'var(--color-line-strong)' }} />
            Anchors (hospital/uni/rail)
          </button>
        </div>
      </div>

      {/* status region (announced) */}
      <div aria-live="polite" className="absolute right-3 top-3 z-10 max-w-[14rem] text-right">
        {status === 'error' && (
          <span className="chip border-transparent text-paper" style={{ background: 'var(--color-danger)' }}>Couldn’t load places</span>
        )}
        {status === 'ok' && count === 0 && (
          <span className="chip">No places yet. Add one below.</span>
        )}
        {status === 'ok' && count > 0 && (
          <span className="chip coord">{count} place{count === 1 ? '' : 's'}</span>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded border border-line bg-paper/95 px-2 py-2 shadow-md backdrop-blur">
        <span className="label px-1">
          {addType ? (addType === 'land' ? 'Draw the boundary' : 'Click to place') : 'Add'}
        </span>
        {NODE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setAddType(addType === t ? null : t)}
            aria-pressed={addType === t}
            className="rounded-[3px] px-3 py-1 text-sm font-medium text-paper transition-colors"
            style={{ background: addType === t ? 'var(--color-ink)' : `var(--color-${t})` }}
          >
            {TYPE_EMOJI[t]} {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {toast && (
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded border border-line-strong bg-ink px-4 py-2 text-sm text-paper shadow" role="status">
          {toast}
        </div>
      )}

      {draft && (
        <SubmissionModal
          type={draft.type}
          location={{ lat: draft.lat, lng: draft.lng }}
          boundary={draft.boundary}
          onClose={() => setDraft(null)}
          onSuccess={() => {
            setDraft(null)
            setToast('Submitted for review — thanks!')
            setTimeout(() => setToast(null), 3500)
            void renderMarkers()
          }}
        />
      )}
    </div>
  )
}

// Shoelace area-weighted centroid of a closed ring; falls back to bbox centre for
// degenerate/zero-area rings so the pin stays inside (or at least near) the parcel.
function centroid(ring: [number, number][]): [number, number] {
  let a = 0, cx = 0, cy = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i]
    const [x1, y1] = ring[i + 1]
    const cross = x0 * y1 - x1 * y0
    a += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  }
  a *= 0.5
  if (Math.abs(a) < 1e-12) {
    const xs = ring.map((p) => p[0])
    const ys = ring.map((p) => p[1])
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]
  }
  return [cx / (6 * a), cy / (6 * a)]
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
