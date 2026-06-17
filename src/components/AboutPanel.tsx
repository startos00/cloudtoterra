'use client'

import { NODE_TYPES } from '@/lib/taxonomy'
import { TYPE_LABELS, TYPE_LETTER } from '@/lib/ui'

const today = new Date().toISOString().slice(0, 10)

function FieldNote({ n, kicker, title, children }: { n: string; kicker: string; title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1.75rem_1fr] gap-2.5">
      <span className="meta tabular-nums text-ink-3">{n}</span>
      <div>
        <span className="meta">{kicker}</span>
        <h3 className="mt-0.5 text-sm font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{children}</p>
      </div>
    </div>
  )
}

// The "field notes" — the commons / legend / open-by-design / contribute, folded out
// of the old landing page into the explorer's side panel.
export function AboutPanel({ onAddPlace }: { onAddPlace?: () => void }) {
  return (
    <div className="relative">
      <div
        className="orb pointer-events-none absolute -right-[20%] -top-[6%] h-[40%] w-[120%] rounded-full"
        style={{ background: 'radial-gradient(circle at 42% 42%, rgba(255,149,0,.7) 0%, rgba(255,204,0,.5) 32%, rgba(157,78,221,.34) 62%, rgba(244,244,242,0) 80%)' }}
        aria-hidden
      />
      <div className="relative z-10 px-6 py-7">
        <span className="meta">About · field notes</span>
        <h1 className="mt-3 font-medium uppercase leading-[1.06] tracking-tight" style={{ fontSize: 'clamp(1.4rem, 2vw, 1.9rem)' }}>
          A commons for the<br />ground that&rsquo;s waiting.
        </h1>
        <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-ink-2">
          An open atlas of dormant, distressed, or simply underappreciated ground: land, buildings,
          civic places, and the online societies forming in the cloud to activate them on the land.
        </p>
        <button onClick={onAddPlace} className="btn-ink mt-4">Add a place</button>

        <div className="mt-8 space-y-6 border-t border-ink/15 pt-7">
          <FieldNote n="01" kicker="The commons" title="Surveyed, then shared">
            Anyone can plot a place by dropping a pin, and drawing a boundary for land. Submissions are
            reviewed before they appear, so the map stays trustworthy.
          </FieldNote>

          <div className="grid grid-cols-[1.75rem_1fr] gap-2.5">
            <span className="meta tabular-nums text-ink-3">02</span>
            <div>
              <span className="meta">The legend</span>
              <h3 className="mt-0.5 text-sm font-semibold tracking-tight">What you can map</h3>
              <ul className="mt-1.5 space-y-1.5">
                {NODE_TYPES.map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[13px] text-ink-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full border border-ink text-[9px] font-bold text-ink" aria-hidden>{TYPE_LETTER[t]}</span>
                    {TYPE_LABELS[t]}
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">Each pin carries a condition, from usable to derelict, you can filter by.</p>
            </div>
          </div>

          <FieldNote n="03" kicker="Open by design" title="A public good, not a product">
            Data is licensed CC-BY-4.0; the code is AGPL-3.0 and open source. CloudtoTerra is the
            public-good sibling of Nubis; a curated subset can feed it as signal, but the map stays open.
          </FieldNote>

          <FieldNote n="04" kicker="Contribute" title="Add what you know">
            Switch to the map, choose a type, and add a place in your town. That is the whole ask.
          </FieldNote>
        </div>

        <div className="mt-8 border-t border-ink/15 pt-5">
          <div className="flex items-center justify-between">
            <span className="meta">Filed note</span>
            <span className="meta text-ink-3">Core.v04 · {today}</span>
          </div>
          <div className="mt-2.5 rounded border border-ink/70 bg-[#0c0c0c] p-3 font-mono text-[10px] leading-relaxed text-[#62d27a]">
            <p>[SYS] archive core synced</p>
            <p>[IDX] 4 node classes · L · B · C · S</p>
            <p>[LOG] plots join the map after review</p>
            <p>[NET] data CC-BY-4.0 · code AGPL-3.0 · open</p>
            <p className="text-[#3f9a52]">[ * ] listening for new ground&hellip;</p>
          </div>
        </div>
      </div>
    </div>
  )
}
