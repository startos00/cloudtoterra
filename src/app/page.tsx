import Link from 'next/link'
import { FieldDiagrams } from '@/components/FieldDiagrams'

export default function Home() {
  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] grid-cols-1 lg:grid-cols-[80px_1fr_1fr]">
      {/* margin column */}
      <aside className="hidden flex-col items-center justify-between border-r border-ink py-10 lg:flex">
        <div className="font-sans text-sm font-semibold">01</div>
        <div className="vertical meta flex gap-5">
          <span>CLOUDTOTERRA — PUBLIC ATLAS</span>
          <span>SYS.RDY: TRUE</span>
        </div>
      </aside>

      {/* text column */}
      <main className="flex flex-col border-ink px-6 py-12 lg:border-r lg:px-12 lg:py-16">
        <div className="rise">
          <span className="meta block">CloudtoTerra · An Atlas of Dormant Ground · Ed. 01</span>
          <h1 className="mt-4 text-3xl leading-none lg:text-4xl">Field Conditions<br />of the Quiet City</h1>
        </div>

        <p className="mt-7 font-serif text-lg italic leading-snug text-ink-2">
          An open survey of dormant land, buildings, and civic assets, and the societies forming to
          reactivate them. Local observations aggregate into a public map of where the city has gone
          quiet, and where it is waking.
        </p>

        <div className="mt-9 space-y-5 text-justify font-serif" style={{ hyphens: 'auto' }}>
          <p>
            A field condition is read from the ground up, not imposed from above. In{' '}
            <span className="figure-ref">Fig A</span> dormant assets distribute across the field,
            holding apart yet implying a structure no boundary has drawn. Move through them and they
            reorganise around you.
          </p>
          <p>
            One catalyst deforms the whole field around it (<span className="figure-ref">Fig B</span>);
            overlapping claims and civic layers interfere (<span className="figure-ref">Fig C</span>).
            The grid does not break. It accommodates the anomaly.
          </p>
          <p>
            The terrain is surveyed continuously (<span className="figure-ref">Fig D</span>). And
            increasingly, societies, the startup societies and network communities forming worldwide,
            are organising to claim this quiet ground and bring it back into use.
          </p>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/map" className="btn-ink">Open the map</Link>
          <Link href="/map" className="btn-ghost">Add a place</Link>
        </div>

        <div className="mt-auto border-t border-ink pt-5">
          <div className="data-row"><span>Cursor Vector [X,Y]</span><b id="cursor-pos">0.000, 0.000</b></div>
          <div className="data-row"><span>Active Field Node</span><b id="active-node">NULL</b></div>
          <div className="data-row" style={{ borderBottom: 'none', marginBottom: 0 }}><span>Compute Cycle</span><b id="cycle-count">0</b></div>
        </div>
      </main>

      {/* diagram column (live interactive figures) */}
      <FieldDiagrams />
    </div>
  )
}
