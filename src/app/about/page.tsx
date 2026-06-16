import Link from 'next/link'
import { NODE_TYPES } from '@/lib/taxonomy'
import { TYPE_LABELS, TYPE_EMOJI } from '@/lib/ui'

export const metadata = {
  title: 'About — CloudtoTerra',
  description: 'What CloudtoTerra is, the commons, and how to contribute.',
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-9">
      <p className="label">{label}</p>
      <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-ink-2">{children}</div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <p className="label">About · field notes</p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink">
        A commons for the ground that&apos;s waiting.
      </h1>
      <p className="mt-5 text-lg leading-8 text-ink-2">
        CloudtoTerra, from cloud to land, is an open atlas of dormant, distressed, and underused
        urban assets: land, buildings, and civic places stranded between an old identity and a new
        one, waiting for a community to reactivate them.
      </p>

      <Section label="The commons" title="Surveyed, then shared">
        <p>
          Anyone can plot a place by dropping a pin, and drawing a boundary for land. Submissions
          are reviewed before they appear, so the map stays trustworthy. The result is a shared,
          free, open dataset of reactivation opportunities.
        </p>
      </Section>

      <Section label="The legend" title="What you can map">
        <dl className="divide-y divide-[color:var(--color-line)]">
          {NODE_TYPES.map((t) => (
            <div key={t} className="flex items-center gap-3 py-3">
              <span
                className="grid h-6 w-6 place-items-center rounded-full text-[12px]"
                style={{ background: `var(--color-${t})`, boxShadow: '0 0 0 2px var(--color-paper), 0 0 0 3px var(--color-line-strong)' }}
                aria-hidden
              >
                {TYPE_EMOJI[t]}
              </span>
              <dt className="font-display font-semibold text-ink">{TYPE_LABELS[t]}</dt>
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
          Go to the <Link href="/map" className="text-ember font-semibold hover:underline">map</Link>,
          choose Land, Building, or Civic, and add a place in your town. That is the whole ask.
        </p>
      </Section>
    </div>
  )
}
