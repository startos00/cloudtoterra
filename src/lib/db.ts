import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Production / runtime client. Tests use src/test/pg.ts (pglite) instead.
export const db = drizzle(neon(process.env.DATABASE_URL!), { schema })
