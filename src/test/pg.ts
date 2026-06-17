import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { sql } from 'drizzle-orm'
import * as schema from '@/lib/schema'
import type { Db } from '@/lib/db'

// In-process Postgres for tests. No PostGIS needed in P1 (lat/lng + jsonb).
export async function makeTestDb() {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  // pgcrypto provides gen_random_uuid(); pglite ships with it, but create defensively.
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`)
  } catch {
    // ignore — gen_random_uuid is built in on recent pglite
  }
  await db.execute(sql`
    CREATE TABLE nodes (
      id uuid primary key default gen_random_uuid(),
      type text not null,
      sub_type text not null,
      condition text,
      node_name text not null,
      description text,
      photo_urls text[],
      latitude double precision not null,
      longitude double precision not null,
      boundary jsonb,
      country text,
      city text,
      society_tags text[],
      attributes jsonb,
      status text not null default 'pending',
      is_visible boolean not null default false,
      ip_hash varchar(64),
      contributor_email text,
      source text default 'crowd',
      model_3d_url text,
      featured boolean not null default false,
      created_at timestamptz default now(),
      approved_at timestamptz
    );
  `)
  // pglite db exposes the same drizzle query API; expose it as Db for typed call-sites.
  return { db: db as unknown as Db, client }
}
