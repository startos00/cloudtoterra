import {
  pgTable, uuid, text, doublePrecision, boolean, jsonb, varchar, timestamp, index,
} from 'drizzle-orm/pg-core'

export const nodes = pgTable('nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // land | building | civic
  subType: text('sub_type').notNull(),
  condition: text('condition'), // usable | dormant | distressed | derelict
  nodeName: text('node_name').notNull(),
  description: text('description'),
  photoUrls: text('photo_urls').array(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  boundary: jsonb('boundary'), // GeoJSON polygon; land only
  country: text('country'),
  city: text('city'),
  societyTags: text('society_tags').array(),
  attributes: jsonb('attributes'), // type-specific fields
  status: text('status').notNull().default('pending'), // pending | approved | rejected
  isVisible: boolean('is_visible').notNull().default(false),
  ipHash: varchar('ip_hash', { length: 64 }),
  contributorEmail: text('contributor_email'),
  source: text('source').default('crowd'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
}, (t) => [
  index('nodes_type_visible_idx').on(t.type, t.isVisible),
  index('nodes_status_idx').on(t.status),
  index('nodes_ip_idx').on(t.ipHash, t.createdAt),
])

export type NodeRow = typeof nodes.$inferSelect
export type NewNode = typeof nodes.$inferInsert
