import Link from 'next/link'
import { db } from '@/lib/db'
import { listVisible } from '@/lib/nodes'
import { TYPE_LABELS, prettySub } from '@/lib/ui'
import type { NodeType } from '@/lib/taxonomy'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Places — CloudtoTerra',
  description: 'Browse the mapped dormant land, buildings, and civic assets — a non-map view of the commons.',
}

export default async function PlacesPage() {
  let places: Awaited<ReturnType<typeof listVisible>> = []
  try {
    places = await listVisible(db, {})
  } catch {
    places = [] // no DB / transient error → empty list, page still renders
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Places</h1>
      <p className="mt-2 text-gray-600">
        {places.length} mapped place{places.length === 1 ? '' : 's'} — a non-map view of the commons.
      </p>

      {places.length === 0 ? (
        <p className="mt-8 text-gray-500">
          No places yet. <Link href="/map" className="underline">Add the first →</Link>
        </p>
      ) : (
        <ul className="mt-6 divide-y">
          {places.map((n) => {
            const t = n.type as NodeType
            return (
              <li key={n.id} className="py-4">
                <Link href={`/node/${n.id}`} className="font-medium hover:underline">{n.nodeName}</Link>
                <div className="mt-1 text-xs text-gray-500">
                  {TYPE_LABELS[t]} · {prettySub(n.subType)}
                  {n.condition ? ` · ${n.condition}` : ''}
                  {n.city ? ` · ${n.city}` : ''}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
