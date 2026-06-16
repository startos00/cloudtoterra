import Link from 'next/link'
import { NODE_TYPES } from '@/lib/taxonomy'
import { TYPE_LABELS, TYPE_EMOJI } from '@/lib/ui'

const LEGEND: Record<(typeof NODE_TYPES)[number], { swatch: string; blurb: string }> = {
  land: { swatch: 'var(--color-land)', blurb: 'Vacant lots, brownfields, greyfields, infill. Draw the parcel boundary.' },
  building: { swatch: 'var(--color-building)', blurb: 'Dormant or distressed buildings, whole or a single empty unit within.' },
  civic: { swatch: 'var(--color-civic)', blurb: 'Churches, schools, halls, theatres, armories. The assets nobody else maps.' },
}

const METHOD = [
  { n: '01', t: 'Spot', d: 'Find a dormant lot, building, or civic asset you know.' },
  { n: '02', t: 'Plot', d: 'Drop a pin (draw the boundary for land) and note its condition.' },
  { n: '03', t: 'Survey', d: 'A reviewer checks it before it joins the public map.' },
  { n: '04', t: 'Open', d: 'It enters the commons, free for anyone to use (CC-BY).' },
]

export default function Home() {
  return (
    <>
      {/* ── hero: from cloud to land ─────────────────────────────────────── */}
      <section className="cloud-to-land relative overflow-hidden border-b border-line">
        <div className="graticule absolute inset-0 opacity-60" aria-hidden />
        <Contours />
        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <div className="max-w-2xl rise">
            <p className="label">Open public-good crowd map</p>
            <h1 className="mt-4 font-display font-semibold leading-[0.98] tracking-tight text-ink"
                style={{ fontSize: 'clamp(2.6rem, 6vw, 4.5rem)' }}>
              Map the places<br />waiting to come back.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">
              CloudtoTerra is an open atlas of dormant and distressed land, buildings, and civic
              assets. Anyone can plot a place; the community sees it once it has been surveyed.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/map" className="btn-ink">Explore the map</Link>
              <Link href="/map" className="btn-ghost">Add a place</Link>
            </div>
            <p className="label mt-8 coord">From cloud to land · CC-BY open data · sibling of Nubis</p>
          </div>
        </div>
      </section>

      {/* ── legend ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <p className="label">The legend</p>
          <p className="label coord hidden sm:block">3 keys</p>
        </div>
        <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight">Three things you can plot</h2>
        <dl className="mt-8 divide-y divide-[color:var(--color-line)]">
          {NODE_TYPES.map((t) => (
            <div key={t} className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-1 py-5 sm:grid-cols-[12rem_1fr]">
              <dt className="flex items-center gap-3">
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px]"
                  style={{ background: LEGEND[t].swatch, boxShadow: '0 0 0 2px var(--color-paper), 0 0 0 3px var(--color-line-strong)' }}
                  aria-hidden
                >
                  {TYPE_EMOJI[t]}
                </span>
                <span className="font-display text-lg font-semibold">{TYPE_LABELS[t]}</span>
              </dt>
              <dd className="text-ink-2">{LEGEND[t].blurb}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-ink-3">
          Every pin also carries a <span className="chip">condition</span> from usable to derelict, so you can filter for exactly what you are hunting.
        </p>
      </section>

      {/* ── field method ─────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-paper-raised">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="label">Field method</p>
          <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {METHOD.map((s) => (
              <div key={s.n}>
                <p className="coord text-2xl font-semibold text-ember">{s.n}</p>
                <h3 className="mt-2 font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-1 text-ink-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-12 text-sm text-ink-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <p>Open data (CC-BY-4.0) · Open source (AGPL-3.0) · The public-good sibling of Nubis.</p>
          <Link href="/about" className="label hover:text-ink">About &amp; how to contribute →</Link>
        </div>
      </footer>
    </>
  )
}

/* faint inked contour lines behind the hero — bespoke cartographic imagery, no network */
function Contours() {
  return (
    <svg
      className="pointer-events-none absolute -right-24 -top-10 h-[140%] w-[70%] opacity-[0.5]"
      viewBox="0 0 400 400" fill="none" aria-hidden
      stroke="var(--color-line-strong)" strokeWidth="0.6"
    >
      {[140, 112, 86, 62, 42, 26].map((r, i) => (
        <path
          key={r}
          pathLength={1}
          className="draw"
          style={{ animationDelay: `${i * 120}ms` }}
          d={contour(200, 190, r, i)}
        />
      ))}
      <circle cx="200" cy="190" r="2.4" fill="var(--color-ember)" stroke="none" />
    </svg>
  )
}

// irregular closed "contour" ring so it reads topographic, not like a target
function contour(cx: number, cy: number, r: number, seed: number): string {
  const pts = 14
  let d = ''
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * Math.PI * 2
    const wobble = 1 + 0.06 * Math.sin(a * 3 + seed) + 0.04 * Math.cos(a * 5 - seed)
    const x = cx + Math.cos(a) * r * wobble
    const y = cy + Math.sin(a) * r * wobble * 0.82
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d + 'Z'
}
