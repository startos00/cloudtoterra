'use client'

import { useState } from 'react'
import Link from 'next/link'
import { NODE_TYPES, type NodeType } from '@/lib/taxonomy'
import { TYPE_LABELS, TYPE_LETTER } from '@/lib/ui'
import { FIGURES, GLOW_RGB } from '@/lib/figures'

const vert = { writingMode: 'vertical-rl' as const, transform: 'rotate(180deg)' }
const today = new Date().toISOString().slice(0, 10)

function FieldNote({ n, kicker, title, children }: { n: string; kicker: string; title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[2rem_1fr] gap-3">
      <span className="meta tabular-nums text-ink-3">{n}</span>
      <div>
        <span className="meta">{kicker}</span>
        <h3 className="mt-1 text-base font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-2">{children}</p>
      </div>
    </div>
  )
}

export function ArchiveLog() {
  const [filter, setFilter] = useState<NodeType | 'all'>('all')
  const shown = FIGURES.filter((f) => filter === 'all' || f.type === filter)

  return (
    <div className="grid h-[calc(100dvh-3rem)] grid-cols-[52px_1fr] bg-[#F4F4F2] text-ink">
      {/* archive sidebar */}
      <aside className="flex flex-col items-center justify-between border-r border-ink/15 py-7">
        <div className="text-lg leading-none">≡</div>
        <span className="text-[9px] font-semibold uppercase tracking-[0.1em]" style={vert}>Archive Directory · Vol. 4</span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-3" style={vert}>Sys.Date {today}</span>
      </aside>

      <div className="grid grid-cols-1 overflow-hidden lg:grid-cols-[42%_58%]">
        {/* about · field notes */}
        <section className="relative hidden flex-col overflow-y-auto border-r border-ink/15 lg:flex">
          <div
            className="orb pointer-events-none absolute -right-[10%] -top-[4%] h-[52%] w-[115%] rounded-full"
            style={{ background: 'radial-gradient(circle at 42% 42%, rgba(255,149,0,.85) 0%, rgba(255,204,0,.6) 32%, rgba(157,78,221,.42) 62%, rgba(244,244,242,0) 80%)' }}
            aria-hidden
          />
          <div className="relative z-10 px-10 py-12">
            <span className="meta">About · field notes</span>
            <h1 className="mt-4 font-medium uppercase leading-[1.05] tracking-tight" style={{ fontSize: 'clamp(1.9rem, 2.8vw, 3rem)' }}>
              A commons for the<br />ground that&rsquo;s waiting.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-2">
              CloudtoTerra, from cloud to land, is an open atlas of dormant, distressed, or simply
              underappreciated ground: land, buildings, civic places, and the online societies forming
              in the cloud to activate them on the land.
            </p>
            <div className="mt-6 flex gap-2">
              <Link href="/map" className="btn-ink">Open the map</Link>
              <Link href="/map" className="btn-ghost">Add a place</Link>
            </div>

            <div className="mt-10 space-y-7 border-t border-ink/15 pt-8">
              <FieldNote n="01" kicker="The commons" title="Surveyed, then shared">
                Anyone can plot a place by dropping a pin, and drawing a boundary for land. Submissions
                are reviewed before they appear, so the map stays trustworthy. The result is a shared,
                free, open dataset of reactivation opportunities.
              </FieldNote>

              <div className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="meta tabular-nums text-ink-3">02</span>
                <div>
                  <span className="meta">The legend</span>
                  <h3 className="mt-1 text-base font-semibold tracking-tight">What you can map</h3>
                  <ul className="mt-2 space-y-1.5">
                    {NODE_TYPES.map((t) => (
                      <li key={t} className="flex items-center gap-2.5 text-sm text-ink-2">
                        <span className="grid h-5 w-5 place-items-center rounded-full border border-ink text-[9px] font-bold text-ink" aria-hidden>{TYPE_LETTER[t]}</span>
                        {TYPE_LABELS[t]}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-2">
                    Each pin carries a condition, from usable to derelict, that you can filter by.
                  </p>
                </div>
              </div>

              <FieldNote n="03" kicker="Open by design" title="A public good, not a product">
                The map data is licensed CC-BY-4.0; the code is AGPL-3.0 and open source. CloudtoTerra is
                the public-good sibling of Nubis, a commercial distressed-asset intelligence platform. A
                curated subset of the commons can feed Nubis as signal, but the map itself stays open.
              </FieldNote>

              <FieldNote n="04" kicker="Contribute" title="Add what you know">
                Go to the map, choose a type, and add a place in your town. That is the whole ask.
              </FieldNote>
            </div>

            {/* filed note — archive status log */}
            <div className="mt-9 border-t border-ink/15 pt-6">
              <div className="flex items-center justify-between">
                <span className="meta">Filed note</span>
                <span className="meta text-ink-3">Core.v04 · {today}</span>
              </div>
              <div className="mt-3 rounded border border-ink/70 bg-[#0c0c0c] p-3 font-mono text-[10.5px] leading-relaxed text-[#62d27a]">
                <p>[SYS] archive core synced · {FIGURES.length} typologies catalogued</p>
                <p>[IDX] 4 node classes mapped · L · B · C · S</p>
                <p>[LOG] plots join the map after review</p>
                <p>[NET] data CC-BY-4.0 · code AGPL-3.0 · open</p>
                <p className="text-[#3f9a52]">[ * ] listening for new ground&hellip;</p>
              </div>
            </div>
          </div>
        </section>

        {/* typology catalog */}
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
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] translate-y-1 bg-[#F4F4F2]/95 px-4 pb-3 pt-2 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="text-[9px] font-medium">{f.label}</span>
                  <p className="mt-0.5 text-[10px] leading-snug text-ink-2">{f.blurb}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
