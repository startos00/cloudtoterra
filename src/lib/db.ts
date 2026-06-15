import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Shared DB type used across data-access fns. Tests pass a pglite db cast to this
// (same drizzle query API), so call-sites stay strongly typed without `any`.
export type Db = NeonHttpDatabase<typeof schema>

// Lazy: don't require DATABASE_URL until the first query (keeps build/import safe).
let _db: ReturnType<typeof drizzle<typeof schema>> | undefined
function getDb() {
  if (!_db) _db = drizzle(neon(process.env.DATABASE_URL!), { schema })
  return _db
}

// Proxy so existing `import { db }` call-sites work unchanged; methods stay bound.
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_t, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>
    const v = real[prop]
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(real) : v
  },
})
