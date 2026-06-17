import Link from 'next/link'
import { NODE_TYPES, CONDITIONS } from '@/lib/taxonomy'
import { TYPE_LABELS, TYPE_LETTER } from '@/lib/ui'

export const metadata = {
  title: 'Field Guide — Using the map — CloudtoTerra',
  description: 'How to read, search, filter, and add places on the CloudtoTerra interactive map.',
}

const ACCENT = '#2c52ff'

function Pin({ letter, ring }: { letter: string; ring?: boolean }) {
  return (
    <span
      className="grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-white text-[10px] font-bold leading-none text-ink"
      style={ring ? { boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${ACCENT}` } : undefined}
      aria-hidden
    >
      {letter}
    </span>
  )
}

function Step({ n, kicker, title, children, aside }: { n: string; kicker: string; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-ink/15 py-8 sm:grid-cols-[3rem_1fr_minmax(0,12rem)] sm:gap-6">
      <span className="text-sm font-semibold tabular-nums text-ink-3">{n}</span>
      <div>
        <span className="meta">{kicker}</span>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink-2">{children}</div>
      </div>
      {aside && <div className="col-span-2 mt-1 sm:col-span-1 sm:mt-0">{aside}</div>}
    </section>
  )
}

export default function GuidePage() {
  return (
    <div className="relative min-h-[calc(100dvh-3rem)] overflow-hidden bg-[#F4F4F2] text-ink">
      <div
        className="orb pointer-events-none absolute -right-[15%] -top-[10%] h-[55%] w-[70%] rounded-full"
        style={{ background: 'radial-gradient(circle at 40% 40%, rgba(255,149,0,.55) 0%, rgba(255,204,0,.4) 35%, rgba(157,78,221,.3) 65%, rgba(244,244,242,0) 80%)' }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-14 sm:px-10">
        <span className="meta">Field Guide · Vol. 04</span>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Using the map</h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-2">
          The map is the whole tool. You read the ground others have logged, search any address, filter
          by what you care about, and add what you know in your own town. Here is the full loop.
        </p>
        <div className="mt-7 flex gap-2">
          <Link href="/map" className="btn-ink">Open the map</Link>
          <Link href="/places" className="btn-ghost">Browse the archive</Link>
        </div>

        <div className="mt-12">
          <Step
            n="01" kicker="Read" title="Pins, lettered by type"
            aside={
              <div className="flex items-center gap-3">
                {NODE_TYPES.map((t) => <Pin key={t} letter={TYPE_LETTER[t]} />)}
                <Pin letter="S" ring />
              </div>
            }
          >
            <p>
              Every place is a disc marked with a letter: <strong>L</strong> land, <strong>B</strong> building,
              <strong> C</strong> civic asset, <strong>S</strong> society. A blue ring means a
              <strong> curated</strong> entry seeded by us.
            </p>
            <p>Click any pin to open the inspector, with its type, name, coordinates, condition, photos, and a link to the full record.</p>
          </Step>

          <Step
            n="02" kicker="Find" title="Search any address or place"
            aside={
              <div className="glass flex items-center gap-2 rounded border border-ink/20 px-3 py-2 text-xs">
                <span className="meta">Find</span>
                <span className="text-ink-3">an address&hellip;</span>
                <span className="ml-auto meta" style={{ color: ACCENT }}>Go</span>
              </div>
            }
          >
            <p>
              Use the search field at the top of the map. Type a street, suburb, or city and press
              <strong> Go</strong>. The map flies to the match and drops a marker, so you can scan that
              neighbourhood or start adding a place nearby.
            </p>
          </Step>

          <Step n="03" kicker="Filter" title="Show only what matters">
            <p>The Field Map panel on the left controls what you see:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>Layers</strong> — toggle Land, Building, Civic, and Society on or off.</li>
              <li><strong>Condition</strong> — narrow to a state, from <em>usable</em> to <em>derelict</em>.</li>
              <li><strong>Overlays</strong> — switch on the distress-density heatmap or the institutional-anchors layer (hospitals, universities, transit) to read a place in context.</li>
            </ul>
          </Step>

          <Step
            n="04" kicker="Add" title="Plot a place in four steps"
            aside={
              <svg viewBox="0 0 100 70" className="w-full max-w-[11rem] text-ink" aria-hidden>
                <polygon points="14,52 30,16 70,12 86,46 52,62" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" strokeLinejoin="round" />
                <circle cx="50" cy="38" r="7" fill="#fff" stroke="currentColor" strokeWidth="3" />
              </svg>
            }
          >
            <ol className="ml-4 list-decimal space-y-1">
              <li>Click <strong>Add</strong> and choose a type.</li>
              <li>Click the map to drop the pin. For <strong>land</strong>, draw the boundary.</li>
              <li>Fill the form: sub-type, condition, a name, and a short description.</li>
              <li>Drag in up to six photos (resized in your browser), then submit.</li>
            </ol>
            <p>Submissions are held for review and appear on the map once a reviewer approves them, so the commons stays trustworthy.</p>
          </Step>

          <Step n="05" kicker="Legend" title="What the marks mean">
            <dl className="divide-y divide-ink/10">
              {NODE_TYPES.map((t) => (
                <div key={t} className="flex items-center gap-3 py-2.5">
                  <Pin letter={TYPE_LETTER[t]} />
                  <dt className="text-sm font-semibold">{TYPE_LABELS[t]}</dt>
                </div>
              ))}
              <div className="flex items-center gap-3 py-2.5">
                <Pin letter="S" ring />
                <dt className="text-sm font-semibold">Curated <span className="font-normal text-ink-3">— seeded by CloudtoTerra</span></dt>
              </div>
            </dl>
            <p className="mt-3">
              Condition runs <span className="font-mono text-xs">{CONDITIONS.join(' → ')}</span>. Societies carry no
              condition: they form in the cloud to activate ground that may be dormant, distressed, or simply underappreciated.
            </p>
          </Step>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-ink/15 pt-8">
          <p className="max-w-md text-sm text-ink-2">
            That is the whole ask: read the ground, then add what you know.
          </p>
          <Link href="/map" className="btn-ink">Open the map</Link>
        </div>

        <p className="meta mt-10 text-ink-3">Open commons · data CC-BY-4.0 · code AGPL-3.0</p>
      </div>
    </div>
  )
}
