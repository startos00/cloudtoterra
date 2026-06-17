import Link from 'next/link'
import { NODE_TYPES } from '@/lib/taxonomy'
import { TYPE_LABELS, TYPE_LETTER } from '@/lib/ui'

export const metadata = {
  title: 'About — CloudtoTerra',
  description: 'What CloudtoTerra is, the commons, and how to contribute.',
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink/15 py-8">
      <p className="label">{label}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-ink-2">{children}</div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <div className="aurora min-h-[calc(100dvh-3rem)] px-5 py-12">
      <article className="glass mx-auto max-w-2xl p-8 sm:p-10">
        <p className="label">About · field notes</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
          A commons for the ground that&apos;s waiting.
        </h1>
        <p className="mt-5 text-lg leading-8 text-ink-2">
          CloudtoTerra, from cloud to land, is an open atlas of dormant, distressed, and underused
          urban assets: land, buildings, civic places, and the societies forming to reactivate them.
        </p>

        <Section label="The commons" title="Surveyed, then shared">
          <p>
            Anyone can plot a place by dropping a pin, and drawing a boundary for land. Submissions
            are reviewed before they appear, so the map stays trustworthy. The result is a shared,
            free, open dataset of reactivation opportunities.
          </p>
        </Section>

        <Section label="The legend" title="What you can map">
          <dl className="divide-y divide-ink/10">
            {NODE_TYPES.map((t) => (
              <div key={t} className="flex items-center gap-3 py-3">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-ink text-[10px] font-bold" aria-hidden>{TYPE_LETTER[t]}</span>
                <dt className="font-semibold">{TYPE_LABELS[t]}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-2">Each pin carries a condition, from usable to derelict, that you can filter by.</p>
        </Section>

        <Section label="Open by design" title="A public good, not a product">
          <p>
            The map data is licensed CC-BY-4.0; the code is AGPL-3.0 and open source. CloudtoTerra is
            the public-good sibling of Nubis, a commercial distressed-asset intelligence platform. A
            curated subset of the commons can feed Nubis as signal, but the map itself stays open.
          </p>
        </Section>

        <Section label="Contribute" title="Add what you know">
          <p>
            Go to the <Link href="/map" className="font-semibold text-[color:var(--color-accent)] hover:underline">map</Link>,
            choose a type, and add a place in your town. That is the whole ask.
          </p>
        </Section>
      </article>
    </div>
  )
}
