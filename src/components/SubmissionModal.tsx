'use client'

import { useState } from 'react'
import { SUB_TYPES, CONDITIONS, type NodeType } from '@/lib/taxonomy'
import { TYPE_LABELS, prettySub } from '@/lib/ui'

export function SubmissionModal({
  type, location, boundary, onClose, onSuccess,
}: {
  type: NodeType
  location: { lat: number; lng: number }
  boundary?: unknown
  onClose: () => void
  onSuccess: () => void
}) {
  const [subType, setSub] = useState<string>(SUB_TYPES[type][0])
  const [condition, setCond] = useState<string>('dormant')
  const [nodeName, setName] = useState('')
  const [description, setDesc] = useState('')
  const [contributorEmail, setEmail] = useState('')
  const [website, setHp] = useState('') // honeypot
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit() {
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type, subType, condition, nodeName,
          description: description || undefined,
          contributorEmail: contributorEmail || undefined,
          latitude: location.lat, longitude: location.lng,
          boundary, website,
        }),
      })
      const j = await res.json()
      if (!res.ok) { setErr(j.error || 'Failed'); return }
      onSuccess()
    } catch {
      setErr('Network error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-[min(92vw,460px)] rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">New {TYPE_LABELS[type]}</h2>
        <p className="mt-1 text-xs text-gray-500">Submitted privately — appears on the map once approved.</p>

        {/* honeypot */}
        <input
          className="absolute -left-[9999px]" tabIndex={-1} autoComplete="off"
          value={website} onChange={(e) => setHp(e.target.value)} aria-hidden
        />

        <label className="mt-4 block text-sm font-medium">Sub-type
          <select className="mt-1 w-full rounded border p-2" value={subType} onChange={(e) => setSub(e.target.value)}>
            {SUB_TYPES[type].map((s) => <option key={s} value={s}>{prettySub(s)}</option>)}
          </select>
        </label>

        <label className="mt-3 block text-sm font-medium">Condition
          <select className="mt-1 w-full rounded border p-2" value={condition} onChange={(e) => setCond(e.target.value)}>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label className="mt-3 block text-sm font-medium">Name
          <input className="mt-1 w-full rounded border p-2" value={nodeName}
            onChange={(e) => setName(e.target.value)} placeholder="e.g. Old Brewery on Main" />
        </label>

        <label className="mt-3 block text-sm font-medium">Description
          <textarea className="mt-1 w-full rounded border p-2" rows={2} value={description}
            onChange={(e) => setDesc(e.target.value)} placeholder="What makes this place notable?" />
        </label>

        <label className="mt-3 block text-sm font-medium">Email <span className="font-normal text-gray-400">(optional — for approval notice)</span>
          <input className="mt-1 w-full rounded border p-2" type="email" value={contributorEmail}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded px-3 py-2 text-sm hover:bg-gray-100" onClick={onClose}>Cancel</button>
          <button
            className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
            disabled={busy || nodeName.trim().length < 2}
            onClick={submit}
          >
            {busy ? 'Submitting…' : 'Submit for review'}
          </button>
        </div>
      </div>
    </div>
  )
}
