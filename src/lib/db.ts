import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { createRequire } from 'node:module'
import * as schema from './schema'

// Shared DB type used across data-access fns. Tests pass a pglite db cast to this
// (same drizzle query API), so call-sites stay strongly typed without `any`.
export type Db = NeonHttpDatabase<typeof schema>

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>

// Schema for the dev fallback DB (mirrors schema.ts / the migrations).
const DEV_DDL = `
CREATE TABLE IF NOT EXISTS nodes (
  id uuid primary key default gen_random_uuid(),
  type text not null, sub_type text not null, condition text,
  node_name text not null, description text, photo_urls text[],
  latitude double precision not null, longitude double precision not null,
  boundary jsonb, country text, city text, society_tags text[], attributes jsonb,
  status text not null default 'pending', is_visible boolean not null default false,
  ip_hash varchar(64), contributor_email text, source text default 'crowd',
  model_3d_url text, featured boolean not null default false,
  model_spec jsonb, model_status text not null default 'none',
  created_at timestamptz default now(), approved_at timestamptz
);`

let _db: DrizzleDb | undefined

function getDb(): DrizzleDb {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (url) {
    _db = drizzle(neon(url), { schema })
    return _db
  }
  // ── Dev fallback ──────────────────────────────────────────────────────────
  // No DATABASE_URL → spin up an in-process Postgres (PGlite) so the app is fully
  // usable locally (submit → admin approve → render) without Neon. In-memory (not
  // file-backed): avoids WASM file-lock crashes under dev HMR; data resets when the
  // dev server restarts, which is fine for a local stand-in. Loaded via createRequire
  // so PGlite never enters the production bundle; prod always has DATABASE_URL.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production')
  }
  // Cache on globalThis: Next dev evaluates this module in multiple bundles (route
  // handlers vs server components). Without a process-global the page would read a
  // different empty in-memory DB than the API wrote to.
  const g = globalThis as unknown as { __cttDevDb?: DrizzleDb }
  if (g.__cttDevDb) { _db = g.__cttDevDb; return _db }
  const nodeRequire = createRequire(import.meta.url)
  const { PGlite } = nodeRequire('@electric-sql/pglite')
  const { drizzle: pgliteDrizzle } = nodeRequire('drizzle-orm/pglite')
  const client = new PGlite()
  // FIFO: this DDL is queued before any query a caller issues afterwards.
  void client.exec(DEV_DDL)
  _db = pgliteDrizzle(client, { schema }) as unknown as DrizzleDb
  g.__cttDevDb = _db
  return _db
}

// Proxy so existing `import { db }` call-sites work unchanged; methods stay bound.
export const db = new Proxy({} as DrizzleDb, {
  get(_t, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>
    const v = real[prop]
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(real) : v
  },
})
