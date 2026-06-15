import Link from 'next/link'
import { NODE_TYPES } from '@/lib/taxonomy'
import { TYPE_LABELS, TYPE_EMOJI, TYPE_COLORS } from '@/lib/ui'

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="py-20 text-center sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">from cloud to land</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          A public map of places<br />waiting to be reactivated.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-gray-600">
          CloudtoTerra is an open, public-good crowd map of dormant and distressed
          land, buildings, and civic assets. Anyone can add a place; the community sees it once it&apos;s reviewed.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/map" className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800">
            Explore the map
          </Link>
          <Link href="/map" className="rounded-full border px-6 py-3 text-sm font-medium hover:bg-gray-50">
            Add a place
          </Link>
        </div>
      </section>

      <section className="grid gap-4 pb-16 sm:grid-cols-3">
        {NODE_TYPES.map((t) => (
          <div key={t} className="rounded-xl border p-5">
            <div className="text-3xl" style={{ color: TYPE_COLORS[t] }}>{TYPE_EMOJI[t]}</div>
            <h3 className="mt-2 font-semibold">{TYPE_LABELS[t]}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {t === 'land' && 'Vacant lots, brownfields, greyfields — draw the parcel boundary.'}
              {t === 'building' && 'Dormant or distressed buildings — whole structures or vacant units.'}
              {t === 'civic' && 'Churches, schools, halls, theatres — the assets nobody else maps.'}
            </p>
          </div>
        ))}
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>Open data (CC-BY-4.0) · Open source (AGPL-3.0) · The public-good sibling of Nubis.</p>
        <p className="mt-1"><Link href="/about" className="underline">About &amp; how to contribute →</Link></p>
      </footer>
    </div>
  )
}
