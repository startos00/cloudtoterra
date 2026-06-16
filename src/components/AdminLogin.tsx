'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminLogin() {
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function login() {
    setBusy(true)
    setErr(null)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setBusy(false)
    if (!res.ok) { setErr('Wrong password'); return }
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <p className="label">Restricted · survey office</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-ink-3">Sign in to review submissions.</p>
      <label htmlFor="admin-password" className="mt-6 block text-sm font-medium text-ink">Password</label>
      <input
        id="admin-password"
        type="password"
        className="mt-1 w-full rounded border border-line bg-paper p-2 text-ink"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && login()}
        aria-invalid={!!err}
        aria-describedby={err ? 'login-error' : undefined}
      />
      {err && <p id="login-error" role="alert" className="mt-2 text-sm text-[color:var(--color-danger)]">{err}</p>}
      <button className="btn-ink mt-4 w-full justify-center disabled:opacity-50" disabled={busy || !password} onClick={login}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </div>
  )
}
