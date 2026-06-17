'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { NODE_TYPES, type NodeType } from '@/lib/taxonomy'
import { TYPE_LABELS, prettySub, type PublicNode } from '@/lib/ui'
import { PRE_NODES } from '@/lib/prenodes'

const vert = { writingMode: 'vertical-rl' as const, transform: 'rotate(180deg)' }
const today = new Date().toISOString().slice(0, 10)

// abstract per-type glyph drawn into each card canvas
const GLYPH: Record<NodeType, React.ReactNode> = {
  land: (
    <g fill="currentColor" stroke="none">
      {[[30, 38], [54, 52], [44, 26], [68, 36], [34, 64], [60, 68], [48, 48], [74, 58]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.2" />
      ))}
    </g>
  ),
  building: (
    <g stroke="currentColor" fill="none" strokeWidth="3">
      <rect x="26" y="22" width="48" height="62" />
      {[34, 50, 66].map((y) => <line key={y} x1="26" y1={y} x2="74" y2={y} />)}
      <line x1="50" y1="22" x2="50" y2="84" />
    </g>
  ),
  civic: (
    <g stroke="currentColor" fill="none" strokeWidth="3">
      <path d="M20 42 L50 22 L80 42" />
      {[30, 43, 57, 70].map((x, i) => <line key={i} x1={x} y1="48" x2={x} y2="80" />)}
      <line x1="16" y1="84" x2="84" y2="84" />
    </g>
  ),
  society: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      <line x1="30" y1="34" x2="64" y2="28" /><line x1="64" y1="28" x2="74" y2="64" />
      <line x1="74" y1="64" x2="38" y2="74" /><line x1="38" y1="74" x2="30" y2="34" />
      <line x1="30" y1="34" x2="74" y2="64" />
      {[[30, 34], [64, 28], [74, 64], [38, 74]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.5" fill="currentColor" />)}
    </g>
  ),
}

export function Archive() {
  const [nodes, setNodes] = useState<PublicNode[]>([])
  const [filter, setFilter] = useState<NodeType | 'all'>('all')
  const [q, setQ] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('/api/nodes')
        const d = r.ok ? (await r.json()).data ?? [] : []
        if (alive) setNodes(d)
      } catch {
        if (alive) setNodes([])
      }
    })()
    return () => { alive = false }
  }, [])

  const all = useMemo(() => [...PRE_NODES, ...nodes], [nodes])
  const shown = all.filter(
    (n) =>
      (filter === 'all' || n.type === filter) &&
      (!q || `${n.nodeName} ${n.city ?? ''} ${n.subType}`.toLowerCase().includes(q.toLowerCase())),
  )

  return (
    <div className="relative min-h-[calc(100dvh-3rem)] text-ink" style={{ background: '#f3f3f1' }}>
      <div className="ambient-canvas" aria-hidden><div className="archive-orb" /></div>

      <div className="relative z-10 flex min-h-[calc(100dvh-3rem)] border-l border-ink/15">
        {/* rotated rail */}
        <aside className="sticky top-0 hidden h-[calc(100dvh-3rem)] w-[60px] shrink-0 flex-col items-center border-r border-ink/15 py-10 md:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={vert}>CloudtoTerra · Archive Vol. 04</span>
          <span className="mt-auto text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/50" style={vert}>{today}</span>
        </aside>

        <main className="flex w-full flex-col">
          {/* glass header */}
          <header
            className="sticky top-0 z-20 flex flex-wrap items-center gap-x-10 gap-y-4 border-b border-ink/15 px-6 py-5"
            style={{ background: 'rgba(243,243,241,0.45)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center" aria-hidden>
              <span className="h-6 w-6 rounded-full bg-ink" />
              <span className="-ml-3 h-6 w-6 border border-ink" style={{ background: '#f3f3f1' }} />
            </div>
            <div className="hidden flex-col gap-1 sm:flex">
              <span className="text-[9px] font-semibold uppercase tracking-[0.08em]">The Commons</span>
              <span className="text-[11px] font-medium uppercase tracking-[0.02em]">Public Atlas of Ground</span>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-x-10 gap-y-4">
              <div className="flex flex-wrap gap-6">
                {(['all', ...NODE_TYPES] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className="border-b pb-1 text-[10px] uppercase tracking-[0.08em] transition-colors hover:text-ink"
                    style={{
                      color: filter === t ? '#111' : 'rgba(17,17,17,0.5)',
                      fontWeight: filter === t ? 600 : 500,
                      borderColor: filter === t ? '#111' : 'transparent',
                    }}
                  >
                    {t === 'all' ? 'All' : TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the commons…"
                aria-label="Search the commons"
                className="w-44 border-b border-ink bg-transparent py-2 text-[11px] uppercase tracking-[0.05em] outline-none placeholder:text-ink/40"
              />
            </div>
          </header>

          {/* archive grid */}
          <section className="flex-grow p-6 sm:p-10">
            <div className="mb-8 flex items-center text-[11px] font-semibold uppercase tracking-[0.05em]">
              <span>Index / {String(shown.length).padStart(2, '0')} Places Logged</span>
              <span className="ml-5 h-px flex-grow bg-ink/15" />
            </div>

            <div
              className="grid gap-px border border-ink/15 bg-ink/15"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
            >
              {shown.map((n, i) => {
                const curated = n.id.startsWith('pre-')
                const inner = (
                  <>
                    <div className="flex justify-between border-b border-ink/15 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.05em]">
                      <span>FIG. {String(i + 1).padStart(3, '0')}</span>
                      <span className="text-ink/40">{TYPE_LABELS[n.type].split(' ')[0]}</span>
                    </div>
                    <div className="flex flex-grow items-center justify-center p-7">
                      <svg viewBox="0 0 100 100" className="h-full max-h-28 w-full transition-transform duration-300 group-hover:scale-105">{GLYPH[n.type]}</svg>
                    </div>
                    <div className="border-t border-ink/15 px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-semibold">{n.nodeName}</span>
                        <span
                          className={`shrink-0 text-[9px] font-semibold uppercase tracking-[0.05em] ${
                            curated ? 'text-ink/40' : 'text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                          }`}
                        >
                          {curated ? 'curated' : 'view →'}
                        </span>
                      </div>
                      <span className="mt-0.5 block truncate text-[9px] uppercase tracking-[0.05em] text-ink/50">
                        {n.city ?? prettySub(n.subType)}
                      </span>
                    </div>
                  </>
                )
                return curated ? (
                  <div key={n.id} className="archive-card group">{inner}</div>
                ) : (
                  <Link key={n.id} href={`/node/${encodeURIComponent(n.id)}`} className="archive-card group">{inner}</Link>
                )
              })}
              {shown.length === 0 && (
                <div className="col-span-full py-24 text-center text-[12px] uppercase tracking-[0.1em] text-ink/50" style={{ background: 'rgba(243,243,241,0.55)' }}>
                  No places match your criteria.
                </div>
              )}
            </div>

            <div className="mt-10 flex justify-between text-[9px] font-semibold uppercase tracking-[0.08em] text-ink/60">
              <span>Archive · {shown.length} shown</span>
              <span>Open commons · CC-BY</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
