'use client'

import { useState } from 'react'
import { TYPE_LABELS, prettySub } from '@/lib/ui'
import type { NodeType } from '@/lib/taxonomy'

type Item = {
  id: string
  type: NodeType
  subType: string
  condition: string | null
  nodeName: string
  description: string | null
  city: string | null
  latitude: number
  longitude: number
  photoUrls: string[] | null
}

export function AdminQueue({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial)
  const [busy, setBusy] = useState<string | null>(null)

  async function act(id: string, status: 'approved' | 'rejected') {
    setBusy(id)
    const res = await fetch(`/api/nodes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setBusy(null)
    if (res.ok) setItems((xs) => xs.filter((x) => x.id !== id))
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <p className="label">Review queue</p>
        <p className="label coord">{items.length} pending</p>
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">Pending submissions</h1>

      {items.length === 0 && <p className="mt-10 text-ink-3">Nothing pending. The map is up to date.</p>}

      <ul className="mt-7 space-y-3">
        {items.map((n) => (
          <li key={n.id} className="rounded border border-line bg-paper-raised p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: `var(--color-${n.type})` }} aria-hidden />
                  <span className="font-display text-lg font-semibold">{n.nodeName}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className="chip">{TYPE_LABELS[n.type]}</span>
                  <span className="chip">{prettySub(n.subType)}</span>
                  {n.condition && <span className="chip">{n.condition}</span>}
                  {n.city && <span className="chip">{n.city}</span>}
                </div>
                {n.description && <p className="mt-2 text-sm text-ink-2">{n.description}</p>}
                <a
                  className="label mt-2 inline-block normal-case tracking-wide text-ink-3 hover:text-ember"
                  style={{ textTransform: 'none' }}
                  href={`https://www.google.com/maps?q=${n.latitude},${n.longitude}`}
                  target="_blank" rel="noreferrer"
                >
                  {n.latitude.toFixed(4)}, {n.longitude.toFixed(4)} ↗
                </a>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button className="btn-ink disabled:opacity-50" disabled={busy === n.id} onClick={() => act(n.id, 'approved')}>Approve</button>
                <button className="btn-ghost disabled:opacity-50" disabled={busy === n.id} onClick={() => act(n.id, 'rejected')}>Reject</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
