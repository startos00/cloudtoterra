import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getNode } from '@/lib/nodes'
import { TYPE_LABELS, prettySub } from '@/lib/ui'
import type { NodeType } from '@/lib/taxonomy'

export default async function NodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const node = await getNode(db, id)
  if (!node || !node.isVisible) notFound()

  const type = node.type as NodeType
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/map" className="text-sm text-gray-500 hover:underline">← Back to map</Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{node.nodeName}</h1>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-gray-100 px-2 py-1">{TYPE_LABELS[type]}</span>
        <span className="rounded-full bg-gray-100 px-2 py-1">{prettySub(node.subType)}</span>
        {node.condition && <span className="rounded-full bg-gray-100 px-2 py-1">{node.condition}</span>}
        {node.city && <span className="rounded-full bg-gray-100 px-2 py-1">{node.city}</span>}
      </div>

      {node.description && <p className="mt-5 leading-7 text-gray-800">{node.description}</p>}

      {node.photoUrls && node.photoUrls.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {node.photoUrls.map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} src={u} alt={node.nodeName} className="rounded-lg border object-cover" />
          ))}
        </div>
      )}

      <p className="mt-6 text-sm text-gray-500">
        Location: {node.latitude.toFixed(5)}, {node.longitude.toFixed(5)}
      </p>
    </div>
  )
}
