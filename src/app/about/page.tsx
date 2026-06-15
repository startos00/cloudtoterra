import Link from 'next/link'

export const metadata = {
  title: 'About — CloudtoTerra',
  description: 'What CloudtoTerra is, the commons, and how to contribute.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 leading-7 text-gray-800">
      <h1 className="text-3xl font-semibold tracking-tight">About CloudtoTerra</h1>

      <p className="mt-6">
        CloudtoTerra — <em>from cloud to land</em> — is an open, public-good crowd map of dormant,
        distressed, and underused urban assets: land parcels, buildings, and civic assets that are
        stranded between an old identity and a new one, waiting for community reactivation.
      </p>

      <h2 className="mt-8 text-xl font-semibold">The commons</h2>
      <p className="mt-2">
        Anyone can add a place by dropping a pin (and, for land, drawing its boundary). Submissions
        are reviewed before they appear, so the map stays trustworthy. The result is a shared,
        free, open dataset of reactivation opportunities.
      </p>

      <h2 className="mt-8 text-xl font-semibold">What you can map</h2>
      <ul className="mt-2 list-disc pl-5">
        <li><strong>Land</strong> — vacant lots, brownfields, greyfields, infill (with a drawn boundary).</li>
        <li><strong>Building</strong> — dormant or distressed buildings, whole or a vacant unit within.</li>
        <li><strong>Civic Asset</strong> — churches, schools, halls, theatres, armories, clubs.</li>
      </ul>
      <p className="mt-2">Each pin also carries a <strong>condition</strong> (usable → derelict) you can filter by.</p>

      <h2 className="mt-8 text-xl font-semibold">Open by design</h2>
      <p className="mt-2">
        The map data is licensed <strong>CC-BY-4.0</strong>; the code is <strong>AGPL-3.0</strong> and
        open source. CloudtoTerra is the public-good sibling of <strong>Nubis</strong>, a commercial
        distressed-asset intelligence platform — a curated subset of the commons can feed Nubis as signal.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Contribute</h2>
      <p className="mt-2">
        Head to the <Link href="/map" className="underline">map</Link>, choose Land / Building / Civic,
        and add what you know about your town. That&apos;s it.
      </p>
    </div>
  )
}
