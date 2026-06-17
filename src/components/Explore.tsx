'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { AboutPanel } from './AboutPanel'
import { NodeGrid } from './NodeGrid'

// mapbox-gl touches window — load the map client-only.
const MapView = dynamic(() => import('./MapView').then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-ink-3">Loading map…</div>,
})

export function Explore({ initialView = 'map' }: { initialView?: 'map' | 'grid' }) {
  const [view, setView] = useState<'map' | 'grid'>(initialView)
  const [open, setOpen] = useState(true)

  return (
    <div className="flex h-[calc(100dvh-3rem)] overflow-hidden bg-[#F4F4F2] text-ink">
      {/* collapsible field-notes panel */}
      {open && (
        <aside className="hidden w-[340px] shrink-0 overflow-y-auto border-r border-ink/15 md:block">
          <AboutPanel onAddPlace={() => setView('map')} />
        </aside>
      )}

      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* toolbar: panel toggle (left) + view toggle (right) */}
        <div className="flex shrink-0 items-center justify-between border-b border-ink/15 px-4 py-2.5">
          <button
            onClick={() => setOpen((o) => !o)}
            className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-2 transition-colors hover:text-ink md:inline-flex"
            aria-expanded={open}
          >
            {open ? '‹ Hide notes' : '› Notes'}
          </button>
          <div className="ml-auto flex border border-ink/25">
            {(['map', 'grid'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors"
                style={{ background: view === v ? '#111' : 'transparent', color: view === v ? '#fff' : '#111' }}
              >
                {v === 'map' ? 'Map' : 'Grid'}
              </button>
            ))}
          </div>
        </div>

        {/* keep the map mounted across toggles (avoids re-init); just hide it under the grid */}
        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0" style={{ visibility: view === 'map' ? 'visible' : 'hidden' }}>
            <MapView />
          </div>
          {view === 'grid' && <div className="absolute inset-0"><NodeGrid /></div>}
        </div>
      </main>
    </div>
  )
}
