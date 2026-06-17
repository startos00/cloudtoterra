'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ModelViewer } from './ModelViewer'
import { TYPE_LABELS, TYPE_LETTER, prettySub } from '@/lib/ui'
import type { NodeType } from '@/lib/taxonomy'
import type { BuildingSpec } from '@/lib/model-spec'

export type RecordNode = {
  id: string
  type: NodeType
  subType: string
  condition: string | null
  nodeName: string
  description: string | null
  city: string | null
  country: string | null
  latitude: number
  longitude: number
  photoUrls: string[] | null
  model3dUrl: string | null
  featured: boolean
  modelSpec: BuildingSpec | null
  modelStatus: string
  source: string | null
  boundary: unknown
  createdAt: string | null
  approvedAt: string | null
  societyTags: string[] | null
}

const vert = { writingMode: 'vertical-rl' as const, transform: 'rotate(180deg)' }
const day = (iso: string | null) => (iso ? iso.slice(0, 10) : '—')

function Micro({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] font-semibold uppercase tracking-[0.08em]">{label}</span>
      <span className="text-[10px] uppercase tracking-[0.02em] text-ink-3">{value}</span>
    </div>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-ink/10 py-2.5">
      <dt className="text-[9px] font-semibold uppercase tracking-[0.06em] text-ink-3">{k}</dt>
      <dd className="text-sm text-ink">{v}</dd>
    </div>
  )
}

export function StudioRecord({ node }: { node: RecordNode }) {
  const coords = `${Math.abs(node.latitude).toFixed(4)}° ${node.latitude >= 0 ? 'N' : 'S'} · ${Math.abs(node.longitude).toFixed(4)}° ${node.longitude >= 0 ? 'E' : 'W'}`
  const photos = node.photoUrls ?? []
  const hasPhotos = photos.length > 0
  const [view, setView] = useState<'model' | 'photos'>(node.model3dUrl ? 'model' : hasPhotos ? 'photos' : 'model')
  const [photoIdx, setPhotoIdx] = useState(0)
  const ref = `FIG. ${node.id.slice(0, 6).toUpperCase()}`
  const approvedSpec = node.modelStatus === 'approved' ? node.modelSpec : null
  const provenance = node.model3dUrl
    ? (node.featured ? 'Curated model' : 'Uploaded model')
    : approvedSpec ? 'Generated model' : 'Procedural massing'

  return (
    <div className="grid h-[calc(100dvh-3rem)] grid-cols-[52px_1fr] bg-[#F4F4F2] text-ink">
      {/* rail */}
      <aside className="hidden flex-col items-center justify-between border-r border-ink/15 py-7 md:flex">
        <Link href="/places" className="text-lg leading-none">≡</Link>
        <span className="text-[9px] font-semibold uppercase tracking-[0.1em]" style={vert}>CloudtoTerra · Field Record</span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-3" style={vert}>{ref}</span>
      </aside>

      <main className="flex min-w-0 flex-col">
        {/* top bar */}
        <header className="grid shrink-0 grid-cols-2 gap-6 border-b border-ink/15 px-6 py-5 sm:grid-cols-4 sm:px-8">
          <Micro label="Record.ref" value={ref} />
          <Micro label="Class" value={TYPE_LABELS[node.type]} />
          <Micro label="Condition" value={node.condition ?? 'n/a'} />
          <Micro label="Coordinates" value={coords} />
        </header>

        {/* workspace */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-px overflow-y-auto bg-ink/15 lg:grid-cols-[340px_1fr_340px] lg:overflow-hidden">
          {/* left — record */}
          <section className="flex flex-col gap-4 overflow-y-auto bg-[#F4F4F2] p-6">
            <span className="w-fit border border-ink px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em]">Field Record</span>
            <div>
              <p className="meta flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full border border-ink text-[9px] font-bold" aria-hidden>{TYPE_LETTER[node.type]}</span>
                {TYPE_LABELS[node.type]} · {prettySub(node.subType)}
              </p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight">{node.nodeName}</h1>
            </div>
            {node.description && <p className="text-sm leading-relaxed text-ink-2">{node.description}</p>}
            <dl className="mt-1">
              <Row k="Type" v={TYPE_LABELS[node.type]} />
              <Row k="Sub-type" v={prettySub(node.subType)} />
              {node.condition && <Row k="Condition" v={node.condition} />}
              <Row k="Location" v={[node.city, node.country].filter(Boolean).join(', ') || '—'} />
              <Row k="Coordinates" v={<span className="tabular-nums">{coords}</span>} />
              {node.societyTags?.length ? <Row k="Tags" v={node.societyTags.map(prettySub).join(', ')} /> : null}
            </dl>
          </section>

          {/* center — visualisation */}
          <section className="relative flex min-h-[55vh] flex-col bg-[#EEEDEA] lg:min-h-0">
            <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3">
              <span className="text-[9px] font-semibold uppercase tracking-[0.08em]">Visualisation</span>
              <div className="flex gap-3 text-[9px] font-semibold uppercase tracking-[0.08em]">
                <button onClick={() => setView('model')} style={{ color: view === 'model' ? '#111' : '#999', borderBottom: `1px solid ${view === 'model' ? '#111' : 'transparent'}` }}>3D Model</button>
                {hasPhotos && <button onClick={() => setView('photos')} style={{ color: view === 'photos' ? '#111' : '#999', borderBottom: `1px solid ${view === 'photos' ? '#111' : 'transparent'}` }}>Photos</button>}
              </div>
            </div>
            <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(circle at 50% 45%, rgba(255,149,0,0.16) 0%, transparent 60%)', filter: 'blur(40px)' }}
                aria-hidden
              />
              {view === 'model' ? (
                <div className="relative aspect-square w-full max-w-[560px] border border-ink/15 bg-[#F4F4F2] shadow-[0_30px_80px_rgba(0,0,0,0.06)]">
                  <ModelViewer modelUrl={node.model3dUrl} kind={node.type} boundary={node.boundary} spec={approvedSpec} />
                </div>
              ) : (
                <div className="relative z-10 w-full max-w-[560px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photos[photoIdx]} alt={`${node.nodeName} — photo ${photoIdx + 1}`} className="aspect-square w-full border border-ink/15 object-cover" />
                  {photos.length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {photos.map((p, i) => (
                        <button key={i} onClick={() => setPhotoIdx(i)} className="h-12 w-12 border" style={{ borderColor: i === photoIdx ? '#111' : 'rgba(17,17,17,0.15)' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* right — metadata */}
          <section className="flex flex-col gap-4 overflow-y-auto bg-[#F4F4F2] p-6">
            <span className="w-fit border border-ink px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em]">Index / Metadata</span>
            {node.featured && <span className="w-fit bg-ink px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#F4F4F2]">★ Featured</span>}
            <dl>
              <Row k="Status" v={node.source === 'curated' ? 'Curated' : 'Approved'} />
              <Row k="Source" v={node.source ?? 'crowd'} />
              <Row k="3D model" v={provenance} />
              <Row k="Logged" v={day(node.createdAt)} />
              <Row k="Approved" v={day(node.approvedAt)} />
              <Row k="Licence" v="CC-BY-4.0" />
            </dl>
            <div className="mt-1 flex flex-col gap-2">
              <Link href="/map" className="btn-ink justify-center">Open the map</Link>
              <a href={`https://www.google.com/maps?q=${node.latitude},${node.longitude}`} target="_blank" rel="noreferrer" className="btn-ghost justify-center">View location ↗</a>
              <Link href="/places" className="meta mt-1 text-center text-ink-3 hover:text-ink">← Back to the archive</Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
