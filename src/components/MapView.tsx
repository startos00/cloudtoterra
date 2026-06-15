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

  const [filters, setFilters] = useState<Filters>({ types: [], condition: '' })
  const [addType, setAddType] = useState<NodeType | null>(null)
  const [draft, setDraft] = useState<{ type: NodeType; lat: number; lng: number; boundary?: unknown } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [missingToken] = useState(!TOKEN)

  const fetchNodes = useCallback(async (): Promise<PublicNode[]> => {
    const p = new URLSearchParams()
    if (filters.condition) p.set('condition', filters.condition)
    const res = await fetch(`/api/nodes?${p.toString()}`)
    const j = await res.json()
    const all: PublicNode[] = j.data ?? []
    return filters.types.length ? all.filter((n) => filters.types.includes(n.type)) : all
  }, [filters])

  const renderMarkers = useCallback(async () => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    const nodes = await fetchNodes()
    for (const n of nodes) {
      const el = document.createElement('div')
      el.style.cssText = `width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer;background:${TYPE_COLORS[n.type]}`
      el.title = n.nodeName
      const popup = new mapboxgl.Popup({ offset: 14 }).setHTML(
        `<strong>${escapeHtml(n.nodeName)}</strong><br/>${TYPE_LABELS[n.type]} · ${escapeHtml(n.subType)}` +
        `${n.condition ? ` · ${n.condition}` : ''}<br/><a href="/node/${n.id}">View →</a>`,
      )
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([n.longitude, n.latitude]).setPopup(popup).addTo(map)
      markersRef.current.push(marker)
    }
  }, [fetchNodes])

  // init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return
    mapboxgl.accessToken = TOKEN
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-78.87, 42.88], // Buffalo-ish default
      zoom: 4,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.on('load', () => { void renderMarkers() })
    return () => { map.remove(); mapRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // re-render markers on filter change
  useEffect(() => { void renderMarkers() }, [renderMarkers])

  // add-mode wiring (click-to-drop for building/civic; draw polygon for land)
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

  if (missingToken) {
    return (
      <div className="grid h-full place-items-center p-8 text-center text-sm text-gray-600">
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

      {/* filters */}
      <div className="absolute left-3 top-3 z-10 w-44"><FilterPanel filters={filters} onChange={setFilters} /></div>

      {/* add controls */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/95 px-2 py-2 shadow-lg backdrop-blur">
        <span className="px-2 text-xs text-gray-500">{addType ? (addType === 'land' ? 'Draw the parcel boundary…' : 'Click the map to place it…') : 'Add a place:'}</span>
        {NODE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setAddType(addType === t ? null : t)}
            className="ml-1 rounded-full px-3 py-1 text-sm text-white"
            style={{ background: addType === t ? '#111' : TYPE_COLORS[t] }}
          >
            {TYPE_EMOJI[t]} {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {toast && (
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-md bg-emerald-600 px-4 py-2 text-sm text-white shadow">{toast}</div>
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

function centroid(ring: [number, number][]): [number, number] {
  const pts = ring.slice(0, -1) // drop closing point
  const n = pts.length || 1
  const sum = pts.reduce((a, p) => [a[0] + p[0], a[1] + p[1]] as [number, number], [0, 0] as [number, number])
  return [sum[0] / n, sum[1] / n]
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
