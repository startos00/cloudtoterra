'use client'

import { useState } from 'react'
import Link from 'next/link'
import { NODE_TYPES, type NodeType } from '@/lib/taxonomy'
import { TYPE_LABELS } from '@/lib/ui'
import { FIGURES, GLOW_RGB } from '@/lib/figures'

const vert = { writingMode: 'vertical-rl' as const, transform: 'rotate(180deg)' }

export function ArchiveLog() {
  const [filter, setFilter] = useState<NodeType | 'all'>('all')
  const shown = FIGURES.filter((f) => filter === 'all' || f.type === filter)

  return (
    <div className="grid h-[calc(100dvh-3rem)] grid-cols-[52px_1fr] bg-[#F4F4F2] text-ink">
      {/* archive sidebar */}
      <aside className="flex flex-col items-center justify-between border-r border-ink/15 py-7">
        <div className="text-lg leading-none">≡</div>
        <span className="text-[9px] font-semibold uppercase tracking-[0.1em]" style={vert}>Archive Directory · Vol. 4</span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-3" style={vert}>Sys.Date {new Date().toISOString().slice(0, 10)}</span>
      </aside>

      <div className="grid grid-cols-1 overflow-hidden lg:grid-cols-[40%_60%]">
        {/* hero */}
        <section className="relative hidden flex-col justify-center overflow-hidden border-r border-ink/15 px-12 py-20 lg:flex">
          <div
            className="orb pointer-events-none absolute -right-[12%] top-[28%] h-[80%] w-[120%] rounded-full"
            style={{ background: 'radial-gradient(circle at 40% 40%, rgba(255,149,0,.9) 0%, rgba(255,204,0,.7) 30%, rgba(157,78,221,.5) 60%, rgba(244,244,242,0) 80%)' }}
            aria-hidden
          />
          <div className="relative z-10">
            <h1 className="font-medium uppercase leading-[1.04] tracking-tight" style={{ fontSize: 'clamp(2.2rem, 3.6vw, 3.7rem)' }}>
              The Archive<br />of Dormant<br />Ground.
            </h1>
            <p className="mt-6 max-w-xs text-xs leading-relaxed text-ink-2">
              A taxonomy of the quiet city: land, buildings, civic assets, and the societies forming
              to reactivate them. Hover any figure to read its field.
            </p>
            <div className="mt-7 flex gap-2">
              <Link href="/map" className="btn-ink">Open the map</Link>
              <Link href="/map" className="btn-ghost">Add a place</Link>
            </div>
          </div>
        </section>

        {/* scroll panel */}
        <div className="flex flex-col overflow-y-auto">
          <header className="sticky top-0 z-10 border-b border-ink/15 bg-[#F4F4F2]/90 px-7 py-5 backdrop-blur">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="meta">Filter typology</span>
                <div className="mt-2 flex flex-wrap gap-3">
                  {(['all', ...NODE_TYPES] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      className="text-[9.5px] font-semibold uppercase tracking-[0.08em]"
                      style={{ color: filter === t ? '#111' : '#666', borderBottom: `1px solid ${filter === t ? '#111' : 'transparent'}`, paddingBottom: 2 }}
                    >
                      {t === 'all' ? 'All' : TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="meta block">Database index</span>
                <span className="meta block text-ink-3">{FIGURES.length} typologies cataloged</span>
              </div>
            </div>
          </header>

          <div className="meta border-b border-ink/15 px-7 py-3 text-ink-3">
            Showing {shown.length} / {FIGURES.length} figures
          </div>

          <div className="grid grid-cols-2 gap-px bg-ink/15 sm:grid-cols-3">
            {shown.map((f) => (
              <article key={f.id} className="group relative flex aspect-square flex-col bg-[#F4F4F2] p-4">
                <div className="flex justify-between text-[8.5px] font-semibold uppercase tracking-wide">
                  <span>{f.fig}</span><span className="text-ink-3">{TYPE_LABELS[f.type].split(' ')[0]}</span>
                </div>
                <div className="relative flex flex-1 items-center justify-center">
                  <div
                    className="pointer-events-none absolute h-4/5 w-4/5 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                    style={{ background: `radial-gradient(circle, rgba(${GLOW_RGB[f.glow]},.75), transparent 70%)` }}
                    aria-hidden
                  />
                  <svg viewBox="0 0 100 100" className="relative z-[2] h-2/5 w-2/5 text-ink transition-transform duration-300 group-hover:scale-110">{f.icon}</svg>
                </div>
                <span className="text-[9px] font-medium text-ink-2">{f.label}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
