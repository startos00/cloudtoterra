import Link from 'next/link'
import { db } from '@/lib/db'
import { listVisible } from '@/lib/nodes'
import { TYPE_LABELS, prettySub } from '@/lib/ui'
import type { NodeType } from '@/lib/taxonomy'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Places — CloudtoTerra',
  description: 'Browse the mapped dormant land, buildings, and civic assets — an index of the commons.',
}

export default async function PlacesPage() {
  let places: Awaited<ReturnType<typeof listVisible>> = []
  try {
    places = await listVisible(db, {})
  } catch {
    places = []
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <p className="label">Index of the commons</p>
        <p className="label coord">{places.length} plotted</p>
      </div>
      <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">Places</h1>
      <p className="mt-2 text-ink-2">A non-map view of everything currently on the atlas.</p>

      {places.length === 0 ? (
        <p className="mt-10 text-ink-3">
          Nothing plotted yet. <Link href="/map" className="text-ember font-semibold hover:underline">Add the first →</Link>
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-[color:var(--color-line)]">
          {places.map((n) => {
            const t = n.type as NodeType
            return (
              <li key={n.id} className="flex items-start gap-4 py-4">
                <span
                  className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{ background: `var(--color-${t})`, boxShadow: '0 0 0 2px var(--color-paper), 0 0 0 3px var(--color-line-strong)' }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <Link href={`/node/${n.id}`} className="font-display text-lg font-semibold hover:text-ember">
                    {n.nodeName}
                  </Link>
                  <div className="label mt-1 normal-case tracking-normal text-ink-3" style={{ textTransform: 'none', letterSpacing: 0 }}>
                    {TYPE_LABELS[t]} · {prettySub(n.subType)}
                    {n.condition ? ` · ${n.condition}` : ''}
                    {n.city ? ` · ${n.city}` : ''}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
