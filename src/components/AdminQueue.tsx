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
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Pending submissions</h1>
      <p className="mt-1 text-sm text-gray-500">{items.length} awaiting review</p>

      {items.length === 0 && <p className="mt-8 text-gray-500">Nothing pending. 🎉</p>}

      <ul className="mt-6 space-y-3">
        {items.map((n) => (
          <li key={n.id} className="rounded-xl border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{n.nodeName}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {TYPE_LABELS[n.type]} · {prettySub(n.subType)}{n.condition ? ` · ${n.condition}` : ''}
                  {n.city ? ` · ${n.city}` : ''}
                </div>
                {n.description && <p className="mt-2 text-sm text-gray-700">{n.description}</p>}
                <a
                  className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                  href={`https://www.google.com/maps?q=${n.latitude},${n.longitude}`}
                  target="_blank" rel="noreferrer"
                >
                  {n.latitude.toFixed(4)}, {n.longitude.toFixed(4)} ↗
                </a>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                  disabled={busy === n.id}
                  onClick={() => act(n.id, 'approved')}
                >
                  Approve
                </button>
                <button
                  className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
                  disabled={busy === n.id}
                  onClick={() => act(n.id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
