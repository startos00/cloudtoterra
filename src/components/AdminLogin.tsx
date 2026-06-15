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
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-1 text-sm text-gray-500">Sign in to review submissions.</p>
      <label htmlFor="admin-password" className="mt-4 block text-sm font-medium">Password</label>
      <input
        id="admin-password"
        type="password"
        className="mt-1 w-full rounded border p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && login()}
        aria-invalid={!!err}
        aria-describedby={err ? 'login-error' : undefined}
      />
      {err && <p id="login-error" role="alert" className="mt-2 text-sm text-red-600">{err}</p>}
      <button
        className="mt-4 w-full rounded bg-black py-2 text-sm text-white disabled:opacity-50"
        disabled={busy || !password}
        onClick={login}
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </div>
  )
}
