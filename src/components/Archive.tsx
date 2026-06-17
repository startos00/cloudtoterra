'use client'

import { useEffect, useMemo, useState } from 'react'
import { NODE_TYPES, type NodeType } from '@/lib/taxonomy'
import { TYPE_LABELS, prettySub, type PublicNode } from '@/lib/ui'
import { PRE_NODES } from '@/lib/prenodes'

const GLYPH: Record<NodeType, React.ReactNode> = {
  land: <g fill="currentColor">{[[32, 42], [56, 56], [46, 30], [68, 40], [38, 66], [62, 70], [50, 50]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" />)}</g>,
  building: <g stroke="currentColor" fill="none" strokeWidth="3"><rect x="24" y="24" width="52" height="52" /><line x1="50" y1="24" x2="50" y2="76" /><line x1="24" y1="50" x2="76" y2="50" /><line x1="37" y1="50" x2="37" y2="76" /></g>,
  civic: <g stroke="currentColor" fill="none" strokeWidth="3"><path d="M20 40 L50 22 L80 40" />{[31, 43, 57, 69].map((x, i) => <line key={i} x1={x} y1="44" x2={x} y2="76" />)}<line x1="18" y1="80" x2="82" y2="80" /></g>,
  society: <g stroke="currentColor" strokeWidth="2.5"><line x1="30" y1="34" x2="64" y2="28" /><line x1="64" y1="28" x2="74" y2="62" /><line x1="74" y1="62" x2="40" y2="72" /><line x1="40" y1="72" x2="30" y2="34" /><line x1="30" y1="34" x2="74" y2="62" />{[[30, 34], [64, 28], [74, 62], [40, 72]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.5" fill="currentColor" />)}</g>,
}

export function Archive() {
  const [nodes, setNodes] = useState<PublicNode[]>([])
  const [filter, setFilter] = useState<NodeType | 'all'>('all')
  const [q, setQ] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try { const r = await fetch('/api/nodes'); const d = r.ok ? (await r.json()).data ?? [] : []; if (alive) setNodes(d) }
      catch { if (alive) setNodes([]) }
    })()
    return () => { alive = false }
  }, [])

  const all = useMemo(() => [...PRE_NODES, ...nodes], [nodes])
  const shown = all.filter(
    (n) => (filter === 'all' || n.type === filter) && (!q || `${n.nodeName} ${n.city ?? ''} ${n.subType}`.toLowerCase().includes(q.toLowerCase())),
  )

  return (
    <div className="aurora min-h-[calc(100dvh-3rem)] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/20 pb-4">
          <div className="flex items-end gap-4">
            <div className="text-5xl font-bold leading-none tracking-tight">{all.length}</div>
            <h1 className="text-xs font-bold uppercase leading-tight tracking-[0.15em]">Archive<br />Index of the Commons</h1>
          </div>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search nodes…"
            className="w-64 border-b border-ink bg-transparent py-2 text-sm outline-none placeholder:text-xs placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-ink-3"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {(['all', ...NODE_TYPES] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="border border-ink px-3 py-1 text-[0.62rem] font-bold uppercase tracking-wide"
              style={{ background: filter === t ? '#000' : 'transparent', color: filter === t ? '#fff' : '#000' }}
            >
              {t === 'all' ? 'All' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
          {shown.map((n) => {
            const curated = n.id.startsWith('pre-')
            const inner = (
              <>
                <div className="glass grid aspect-square place-items-center p-5">
                  <svg viewBox="0 0 100 100" className="h-full w-full">{GLYPH[n.type]}</svg>
                </div>
                <div className="mt-2 flex items-start justify-between gap-2">
                  <span className="text-xs font-bold leading-tight">{n.nodeName}</span>
                  <span className="meta shrink-0">{TYPE_LABELS[n.type].split(' ')[0]}</span>
                </div>
                <span className="mt-0.5 block text-xs text-ink-3">
                  {n.city ?? prettySub(n.subType)}{curated ? ' · curated' : ''}
                </span>
              </>
            )
            return curated
              ? <div key={n.id}>{inner}</div>
              : <a key={n.id} href={`/node/${encodeURIComponent(n.id)}`} className="block transition-transform hover:-translate-y-1">{inner}</a>
          })}
          {shown.length === 0 && <p className="text-ink-3">No nodes match.</p>}
        </div>

        <div className="meta mt-10 flex justify-between border-t border-ink/20 pt-4">
          <span>Archive · {shown.length} shown</span>
          <span>Open commons · CC-BY</span>
        </div>
      </div>
    </div>
  )
}
