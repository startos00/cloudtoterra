import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { getNode } from '@/lib/nodes'
import { TYPE_LABELS, prettySub } from '@/lib/ui'
import type { NodeType } from '@/lib/taxonomy'
import { StudioRecord, type RecordNode } from '@/components/StudioRecord'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const node = await getNode(db, id)
  if (!node || !node.isVisible) return { title: 'Not found — CloudtoTerra' }
  const t = node.type as NodeType
  const title = `${node.nodeName} — CloudtoTerra`
  const description =
    node.description ??
    `${TYPE_LABELS[t]} · ${prettySub(node.subType)}${node.condition ? ` · ${node.condition}` : ''}${node.city ? ` · ${node.city}` : ''}`
  const images = node.photoUrls?.length && /^https?:/.test(node.photoUrls[0]) ? [node.photoUrls[0]] : undefined
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

  const record: RecordNode = {
    id: node.id,
    type: node.type as NodeType,
    subType: node.subType,
    condition: node.condition,
    nodeName: node.nodeName,
    description: node.description,
    city: node.city,
    country: node.country,
    latitude: node.latitude,
    longitude: node.longitude,
    photoUrls: node.photoUrls,
    model3dUrl: node.model3dUrl,
    featured: node.featured,
    source: node.source,
    boundary: node.boundary,
    createdAt: node.createdAt ? node.createdAt.toISOString() : null,
    approvedAt: node.approvedAt ? node.approvedAt.toISOString() : null,
    societyTags: node.societyTags,
  }

  return <StudioRecord node={record} />
}
