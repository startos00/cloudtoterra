'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { NODE_TYPES, CONDITIONS, type NodeType } from '@/lib/taxonomy'
import { TYPE_LABELS, TYPE_LETTER, prettySub, type PublicNode } from '@/lib/ui'
import { PRE_NODES } from '@/lib/prenodes'
import { SubmissionModal } from './SubmissionModal'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
const ACCENT = '#2c52ff'

type AnyNode = PublicNode

function pinCss(curated: boolean, sel: boolean): string {
  return (
    `display:grid;place-items:center;width:20px;height:20px;border-radius:50%;` +
    `border:2px solid ${sel ? ACCENT : '#000'};background:${sel ? ACCENT : '#fff'};color:${sel ? '#fff' : '#000'};` +
    `font:700 9px/1 Helvetica,Arial,sans-serif;cursor:pointer;padding:0;` +
    (curated ? `box-shadow:0 0 0 2px #fff,0 0 0 3px ${ACCENT};` : `box-shadow:0 1px 4px rgba(0,0,0,.3);`)
  )
}
const isCurated = (id: string) => id.startsWith('pre-')
function coords(lat: number, lng: number): string {
  return `${Math.abs(lat).toFixed(3)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lng).toFixed(3)}° ${lng >= 0 ? 'E' : 'W'}`
}

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const elsRef = useRef<Record<string, HTMLButtonElement>>({})
  const renderGenRef = useRef(0)

  const [types, setTypes] = useState<NodeType[]>([...NODE_TYPES])
  const [condition, setCondition] = useState('')
  const [addType, setAddType] = useState<NodeType | null>(null)
  const [draft, setDraft] = useState<{ type: NodeType; lat: number; lng: number; boundary?: unknown } | null>(null)
  const [selected, setSelected] = useState<AnyNode | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [count, setCount] = useState(0)
  const [dbOffline, setDbOffline] = useState(false)
  const [missingToken] = useState(!TOKEN)
  const [showDensity, setShowDensity] = useState(false)
  const [showAnchors, setShowAnchors] = useState(false)

  const renderMarkers = useCallback(async () => {
    const map = mapRef.current
    if (!map) return
    const gen = ++renderGenRef.current
    let dbNodes: PublicNode[] = []
    try {
      const p = new URLSearchParams()
      if (condition) p.set('condition', condition)
      const res = await fetch(`/api/nodes?${p.toString()}`)
      if (!res.ok) throw new Error(String(res.status))
      dbNodes = (await res.json()).data ?? []
      setDbOffline(false)
    } catch {
      setDbOffline(true)
    }
    if (gen !== renderGenRef.current) return
    const all: AnyNode[] = [...PRE_NODES, ...dbNodes].filter(
      (n) => types.includes(n.type) && (!condition || n.condition === condition),
    )
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    elsRef.current = {}
    for (const n of all) {
      const el = document.createElement('button')
      el.type = 'button'
      el.setAttribute('aria-label', `${TYPE_LABELS[n.type]}: ${n.nodeName}`)
      el.textContent = TYPE_LETTER[n.type]
      el.style.cssText = pinCss(isCurated(n.id), false)
      el.onclick = (ev) => { ev.stopPropagation(); setSelected(n) }
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([n.longitude, n.latitude]).addTo(map)
      markersRef.current.push(marker)
      elsRef.current[n.id] = el
    }
    setCount(all.length)
  }, [types, condition])

  // init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return
    mapboxgl.accessToken = TOKEN
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      projection: { name: 'mercator' },
      center: [-30, 25],
      zoom: 1.15,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch sets state only after await
  useEffect(() => { void renderMarkers() }, [renderMarkers])

  // highlight the selected pin without re-rendering all markers
  useEffect(() => {
    for (const [id, el] of Object.entries(elsRef.current)) {
      el.style.cssText = pinCss(isCurated(id), id === selected?.id)
    }
  }, [selected])

  // add-mode wiring
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    function cleanupDraw() { if (drawRef.current) { map!.removeControl(drawRef.current); drawRef.current = null } }
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
    return () => { map.off('click', onClick); map.off('draw.create', onDrawCreate); cleanupDraw() }
  }, [addType])

  // distress-density overlay
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    let cancelled = false
    const SRC = 'ctt-density', LAYER = 'ctt-density-heat'
    const removeLayer = () => { const m = mapRef.current; if (!m) return; if (m.getLayer(LAYER)) m.removeLayer(LAYER); if (m.getSource(SRC)) m.removeSource(SRC) }
    async function add() {
      let data: GeoJSON.FeatureCollection
      try { const res = await fetch('/api/overlays/density'); if (!res.ok) return; data = (await res.json()).data } catch { return }
      const m = mapRef.current
      if (cancelled || !m || !data) return
      const apply = () => {
        const mm = mapRef.current; if (cancelled || !mm) return
        const ex = mm.getSource(SRC) as mapboxgl.GeoJSONSource | undefined
        if (ex) { ex.setData(data); return }
        mm.addSource(SRC, { type: 'geojson', data })
        mm.addLayer({ id: LAYER, type: 'heatmap', source: SRC, paint: { 'heatmap-weight': ['get', 'weight'], 'heatmap-intensity': 1, 'heatmap-radius': 30, 'heatmap-opacity': 0.6 } })
      }
      if (m.isStyleLoaded()) apply(); else m.once('load', apply)
    }
    if (showDensity) void add(); else removeLayer()
    return () => { cancelled = true }
  }, [showDensity])

  // institutional-anchors overlay
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    let cancelled = false
    const SRC = 'ctt-anchors', LAYER = 'ctt-anchors-pts'
    const removeAll = () => { const m = mapRef.current; if (!m) return; if (m.getLayer(LAYER)) m.removeLayer(LAYER); if (m.getSource(SRC)) m.removeSource(SRC) }
    async function load() {
      const m = mapRef.current
      const b = m?.getBounds()
      if (!m || !b) return
      const params = new URLSearchParams({ south: String(b.getSouth()), west: String(b.getWest()), north: String(b.getNorth()), east: String(b.getEast()) })
      let data: GeoJSON.FeatureCollection
      try { const res = await fetch(`/api/overlays/anchors?${params.toString()}`); if (!res.ok) return; data = (await res.json()).data } catch { return }
      const mm = mapRef.current
      if (cancelled || !mm || !data) return
      const apply = () => {
        const m2 = mapRef.current; if (cancelled || !m2) return
        const ex = m2.getSource(SRC) as mapboxgl.GeoJSONSource | undefined
        if (ex) { ex.setData(data); return }
        m2.addSource(SRC, { type: 'geojson', data })
        m2.addLayer({ id: LAYER, type: 'circle', source: SRC, paint: { 'circle-radius': 5, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#fff', 'circle-color': ['match', ['get', 'kind'], 'hospital', '#dc2626', 'university', '#2563eb', 'station', '#059669', '#6b7280'] } })
      }
      if (mm.isStyleLoaded()) apply(); else mm.once('load', apply)
    }
    const onMoveEnd = () => { void load() }
    if (showAnchors) { void load(); map.on('moveend', onMoveEnd) } else removeAll()
    return () => { cancelled = true; map.off('moveend', onMoveEnd) }
  }, [showAnchors])

  function toggleType(t: NodeType) {
    setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))
  }

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
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="h-full w-full" />

      {/* brand + count */}
      <div className="glass absolute left-4 top-4 z-10 px-4 py-3">
        <div className="text-sm font-semibold">Field Map</div>
        <div className="meta mt-1">{count} node{count === 1 ? '' : 's'}{dbOffline ? ' · curated' : ''}</div>
      </div>

      {/* controls */}
      <div className="glass absolute left-4 top-[5.6rem] z-10 w-52 space-y-4 p-4">
        <div>
          <span className="label mb-2 block">Layers</span>
          <div className="flex flex-col gap-1.5">
            {NODE_TYPES.map((t) => (
              <label key={t} className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={types.includes(t)} onChange={() => toggleType(t)} style={{ accentColor: ACCENT }} />
                <span className="grid h-4 w-4 place-items-center rounded-full border border-ink text-[8px] font-bold">{TYPE_LETTER[t]}</span>
                {TYPE_LABELS[t]}
              </label>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="label mb-1 block">Condition</span>
          <select className="w-full border border-ink bg-transparent p-1.5 text-sm" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">any</option>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <div>
          <span className="label mb-2 block">Overlays</span>
          <button onClick={() => setShowDensity((v) => !v)} aria-pressed={showDensity} className="flex w-full items-center gap-2 text-left text-sm">
            <span className="inline-block h-3 w-3 rounded-full border border-ink" style={{ background: showDensity ? ACCENT : 'transparent' }} /> Distress density
          </button>
          <button onClick={() => setShowAnchors((v) => !v)} aria-pressed={showAnchors} className="mt-1.5 flex w-full items-center gap-2 text-left text-sm">
            <span className="inline-block h-3 w-3 rounded-full border border-ink" style={{ background: showAnchors ? ACCENT : 'transparent' }} /> Anchors
          </button>
        </div>
      </div>

      {/* add bar */}
      <div className="glass absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 px-2 py-2">
        <span className="label px-1">{addType ? (addType === 'land' ? 'Draw boundary' : 'Click to place') : 'Add'}</span>
        {NODE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setAddType(addType === t ? null : t)}
            aria-pressed={addType === t}
            className="border px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition-colors"
            style={{ background: addType === t ? '#000' : 'transparent', color: addType === t ? '#fff' : '#000', borderColor: '#000' }}
          >
            {TYPE_LETTER[t]}
          </button>
        ))}
      </div>

      {toast && (
        <div className="glass absolute left-1/2 top-4 z-30 -translate-x-1/2 px-4 py-2 text-sm" role="status" style={{ borderColor: ACCENT }}>{toast}</div>
      )}

      {/* inspector */}
      {selected && (
        <aside className="glass absolute right-4 top-4 z-20 max-h-[calc(100%-2rem)] w-80 overflow-y-auto p-5">
          <div className="flex items-start justify-between">
            <span className="meta">{TYPE_LABELS[selected.type]} · {prettySub(selected.subType)}</span>
            <button onClick={() => setSelected(null)} aria-label="Close" className="meta -mt-1 text-base leading-none">×</button>
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-tight">{selected.nodeName}</h2>
          <div className="meta coord mt-2">{coords(selected.latitude, selected.longitude)}</div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selected.condition && <span className="chip">{selected.condition}</span>}
            {selected.city && <span className="chip">{selected.city}</span>}
            {isCurated(selected.id) && <span className="chip" style={{ borderColor: ACCENT, color: ACCENT }}>Curated</span>}
          </div>
          {selected.description && <p className="mt-3 text-sm leading-relaxed text-ink-2">{selected.description}</p>}
          {!isCurated(selected.id) && (
            <a href={`/node/${encodeURIComponent(selected.id)}`} className="btn-ink mt-4">Open detail</a>
          )}
        </aside>
      )}

      {draft && (
        <SubmissionModal
          type={draft.type}
          location={{ lat: draft.lat, lng: draft.lng }}
          boundary={draft.boundary}
          onClose={() => setDraft(null)}
          onSuccess={() => {
            setDraft(null)
            setToast('Submitted for review, thanks.')
            setTimeout(() => setToast(null), 3500)
            void renderMarkers()
          }}
        />
      )}
    </div>
  )
}

function centroid(ring: [number, number][]): [number, number] {
  let a = 0, cx = 0, cy = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i]
    const [x1, y1] = ring[i + 1]
    const cross = x0 * y1 - x1 * y0
    a += cross; cx += (x0 + x1) * cross; cy += (y0 + y1) * cross
  }
  a *= 0.5
  if (Math.abs(a) < 1e-12) {
    const xs = ring.map((p) => p[0]); const ys = ring.map((p) => p[1])
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]
  }
  return [cx / (6 * a), cy / (6 * a)]
}
