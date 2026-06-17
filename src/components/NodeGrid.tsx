'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { NODE_TYPES, type NodeType } from '@/lib/taxonomy'
import { TYPE_LABELS, prettySub, type PublicNode } from '@/lib/ui'
import { PRE_NODES } from '@/lib/prenodes'

const GLYPH: Record<NodeType, React.ReactNode> = {
  land: <g fill="currentColor" stroke="none">{[[30, 40], [54, 54], [44, 28], [66, 38], [36, 64], [60, 68], [50, 50]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" />)}</g>,
  building: <g stroke="currentColor" fill="none" strokeWidth="3"><rect x="26" y="22" width="48" height="56" /><line x1="50" y1="22" x2="50" y2="78" />{[36, 50, 64].map((y) => <line key={y} x1="26" y1={y} x2="74" y2={y} />)}</g>,
  civic: <g stroke="currentColor" fill="none" strokeWidth="3"><path d="M20 42 L50 22 L80 42" />{[31, 43, 57, 69].map((x, i) => <line key={i} x1={x} y1="48" x2={x} y2="78" />)}<line x1="16" y1="82" x2="84" y2="82" /></g>,
  society: <g stroke="currentColor" strokeWidth="2.5" fill="none"><line x1="30" y1="34" x2="64" y2="28" /><line x1="64" y1="28" x2="74" y2="64" /><line x1="74" y1="64" x2="38" y2="72" /><line x1="38" y1="72" x2="30" y2="34" /><line x1="30" y1="34" x2="74" y2="64" />{[[30, 34], [64, 28], [74, 64], [38, 72]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.5" fill="currentColor" />)}</g>,
}

export function NodeGrid() {
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
    (n) => (filter === 'all' || n.type === filter) && (!q || `${n.nodeName} ${n.city ?? ''} ${n.subType}`.toLowerCase().includes(q.toLowerCase())),
  )

  return (
    <div className="flex h-full flex-col bg-[#F4F4F2]">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-ink/15 px-5 py-3">
        <div className="flex flex-wrap gap-3">
          {(['all', ...NODE_TYPES] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="pb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: filter === t ? '#111' : '#999', borderBottom: `1px solid ${filter === t ? '#111' : 'transparent'}` }}
            >
              {t === 'all' ? 'All' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the commons…"
          aria-label="Search places"
          className="ml-auto w-48 border-b border-ink bg-transparent py-1 text-xs uppercase tracking-[0.05em] outline-none placeholder:text-ink/40"
        />
        <span className="meta text-ink-3">{shown.length}</span>
      </div>

      <div
        className="grid flex-1 content-start gap-px overflow-y-auto border-t border-ink/15 bg-ink/15"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}
      >
        {shown.map((n) => {
          const curated = n.id.startsWith('pre-')
          const inner = (
            <>
              <div className="flex justify-between border-b border-ink/15 px-3 py-2.5 text-[8.5px] font-semibold uppercase tracking-wide">
                <span>{TYPE_LABELS[n.type].split(' ')[0]}</span>
                <span className="text-ink-3">{curated ? 'curated' : 'view →'}</span>
              </div>
              <div className="flex flex-1 items-center justify-center p-6">
                <svg viewBox="0 0 100 100" className="h-2/3 w-2/3 transition-transform duration-300 group-hover:scale-105">{GLYPH[n.type]}</svg>
              </div>
              <div className="border-t border-ink/15 px-3 py-2.5">
                <span className="block truncate text-[11px] font-semibold">{n.nodeName}</span>
                <span className="mt-0.5 block truncate text-[9px] uppercase tracking-[0.05em] text-ink/50">{n.city ?? prettySub(n.subType)}</span>
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
          <div className="col-span-full bg-[#F4F4F2] p-12 text-center text-[12px] uppercase tracking-[0.1em] text-ink/50">No places match.</div>
        )}
      </div>
    </div>
  )
}
