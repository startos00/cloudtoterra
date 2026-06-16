'use client'

import { useEffect, useRef, useState } from 'react'
import { SUB_TYPES, CONDITIONS, type NodeType } from '@/lib/taxonomy'
import { TYPE_LABELS, prettySub } from '@/lib/ui'

const fieldCls = 'mt-1 w-full rounded border border-line bg-paper p-2 text-ink'

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

  const dialogRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    firstFieldRef.current?.focus()
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key !== 'Tab') return
      const root = dialogRef.current
      if (!root) return
      const f = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (f.length === 0) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

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
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-[2px]"
      style={{ background: 'oklch(0.12 0.012 60 / 0.66)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-title"
        className="w-[min(92vw,460px)] rounded border border-line-strong bg-paper p-5 shadow-xl"
      >
        <p className="label flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: `var(--color-${type})` }} aria-hidden />
          New plot
        </p>
        <h2 id="submit-title" className="mt-1 font-display text-2xl font-semibold tracking-tight">{TYPE_LABELS[type]}</h2>
        <p className="mt-1 text-sm text-ink-3">Submitted privately. It joins the map once a reviewer approves it.</p>

        <input
          className="absolute -left-[9999px]" tabIndex={-1} autoComplete="off" aria-hidden
          value={website} onChange={(e) => setHp(e.target.value)}
        />

        <label className="mt-4 block text-sm font-medium text-ink" htmlFor="f-subtype">Sub-type</label>
        <select id="f-subtype" ref={firstFieldRef} className={fieldCls} value={subType} onChange={(e) => setSub(e.target.value)}>
          {SUB_TYPES[type].map((s) => <option key={s} value={s}>{prettySub(s)}</option>)}
        </select>

        <label className="mt-3 block text-sm font-medium text-ink" htmlFor="f-condition">Condition</label>
        <select id="f-condition" className={fieldCls} value={condition} onChange={(e) => setCond(e.target.value)}>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="mt-3 block text-sm font-medium text-ink" htmlFor="f-name">Name</label>
        <input id="f-name" className={fieldCls} value={nodeName}
          onChange={(e) => setName(e.target.value)} placeholder="e.g. Old Brewery on Main" />

        <label className="mt-3 block text-sm font-medium text-ink" htmlFor="f-desc">Description</label>
        <textarea id="f-desc" className={fieldCls} rows={2} value={description}
          onChange={(e) => setDesc(e.target.value)} placeholder="What makes this place notable?" />

        <label className="mt-3 block text-sm font-medium text-ink" htmlFor="f-email">
          Email <span className="font-normal text-ink-3">(optional, for the approval notice)</span>
        </label>
        <input id="f-email" className={fieldCls} type="email" value={contributorEmail}
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

        {err && <p className="mt-3 text-sm text-[color:var(--color-danger)]" role="alert">{err}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-ink disabled:opacity-50" disabled={busy || nodeName.trim().length < 2} onClick={submit}>
            {busy ? 'Submitting…' : 'Submit for review'}
          </button>
        </div>
      </div>
    </div>
  )
}
