import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getNode } from '@/lib/nodes'
import { TYPE_LABELS, prettySub } from '@/lib/ui'
import type { NodeType } from '@/lib/taxonomy'

function coords(lat: number, lng: number): string {
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const node = await getNode(db, id)
  if (!node || !node.isVisible) return { title: 'Not found — CloudtoTerra' }
  const t = node.type as NodeType
  const title = `${node.nodeName} — CloudtoTerra`
  const description =
    node.description ??
    `${TYPE_LABELS[t]} · ${prettySub(node.subType)}${node.condition ? ` · ${node.condition}` : ''}${node.city ? ` · ${node.city}` : ''}`
  const images = node.photoUrls?.length ? [node.photoUrls[0]] : undefined
  return {
    title,
    description,
    openGraph: { title, description, type: 'article', images },
    twitter: { card: images ? 'summary_large_image' : 'summary', title, description },
  }
}

export default async function NodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const node = await getNode(db, id)
  if (!node || !node.isVisible) notFound()

  const t = node.type as NodeType
  return (
    <article className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/map" className="label hover:text-ink">← back to the map</Link>

      <p className="label mt-7 flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: `var(--color-${t})` }} aria-hidden />
        {TYPE_LABELS[t]}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-ink">{node.nodeName}</h1>
      <p className="label coord mt-3 normal-case tracking-wide text-ink-3" style={{ textTransform: 'none' }}>
        {coords(node.latitude, node.longitude)}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="chip">{prettySub(node.subType)}</span>
        {node.condition && <span className="chip">{node.condition}</span>}
        {node.city && <span className="chip">{node.city}</span>}
      </div>

      {node.description && <p className="mt-6 text-lg leading-8 text-ink-2">{node.description}</p>}

      {node.photoUrls && node.photoUrls.length > 0 && (
        <div className="mt-7 grid grid-cols-2 gap-3">
          {node.photoUrls.map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} src={u} alt={`${node.nodeName} — photo ${i + 1}`} className="rounded border border-line object-cover" />
          ))}
        </div>
      )}
    </article>
  )
}
