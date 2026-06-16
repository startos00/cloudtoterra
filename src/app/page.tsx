import Link from 'next/link'
import { NODE_TYPES } from '@/lib/taxonomy'
import { TYPE_LABELS, TYPE_EMOJI } from '@/lib/ui'

const LEGEND: Record<(typeof NODE_TYPES)[number], { blurb: string }> = {
  land: { blurb: 'Vacant lots, brownfields, greyfields, infill. Draw the parcel boundary.' },
  building: { blurb: 'Dormant or distressed buildings, whole or a single empty unit within.' },
  civic: { blurb: 'Churches, schools, halls, theatres, armories. The assets nobody else maps.' },
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
      {/* ── hero: deep survey ────────────────────────────────────────────── */}
      <section className="cloud-to-land relative overflow-hidden border-b border-line">
        <div className="graticule absolute inset-0 opacity-50" aria-hidden />
        {/* ember beacon + live radar sweep + scope rings */}
        <div className="pointer-events-none absolute -right-[8%] top-1/2 hidden h-[40rem] w-[40rem] -translate-y-1/2 sm:block" aria-hidden>
          <div className="absolute inset-0 beacon" />
          <div className="absolute inset-4 radar-sweep opacity-90" />
          <svg className="absolute inset-4" viewBox="0 0 100 100" fill="none" stroke="var(--color-line-strong)" strokeWidth="0.25">
            <circle cx="50" cy="50" r="46" /><circle cx="50" cy="50" r="31" /><circle cx="50" cy="50" r="16" />
            <line x1="4" y1="50" x2="96" y2="50" /><line x1="50" y1="4" x2="50" y2="96" />
            <circle cx="50" cy="50" r="1.8" fill="var(--color-ember)" stroke="none" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-6xl px-5 py-28 sm:py-40">
          <div className="max-w-2xl rise">
            <p className="label">Open public-good crowd map</p>
            <h1 className="mt-5 font-display font-bold tracking-tight text-ink"
                style={{ fontSize: 'clamp(2.9rem, 7vw, 5.6rem)', lineHeight: 0.95 }}>
              Map the ground<br />that&apos;s gone <span className="glow-ember">quiet</span>.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-ink-2">
              CloudtoTerra is an open atlas of dormant and distressed land, buildings, and civic
              assets. Plot what you know; the community sees it once it has been surveyed.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/map" className="btn-ink">Open the map</Link>
              <Link href="/map" className="btn-ghost">Add a place</Link>
            </div>
            <p className="label mt-9 coord">From cloud to land · CC-BY open data · sibling of Nubis</p>
          </div>
        </div>
      </section>

      {/* ── legend ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <p className="label">The legend</p>
          <p className="label coord hidden sm:block">3 keys</p>
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold tracking-tight">Three things you can plot</h2>
        <dl className="mt-8 divide-y divide-[color:var(--color-line)]">
          {NODE_TYPES.map((t) => (
            <div key={t} className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-1 py-5 sm:grid-cols-[12rem_1fr]">
              <dt className="flex items-center gap-3">
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px]"
                  style={{ background: `var(--color-${t})`, boxShadow: `0 0 14px var(--color-${t})` }}
                  aria-hidden
                >
                  {TYPE_EMOJI[t]}
                </span>
                <span className="font-display text-lg font-bold">{TYPE_LABELS[t]}</span>
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
                <p className="coord text-2xl font-bold text-ember">{s.n}</p>
                <h3 className="mt-2 font-display text-xl font-bold">{s.t}</h3>
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
