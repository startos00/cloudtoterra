import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'

// Runs the drizzle migrations over Neon's HTTP driver (no websocket needed).
async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }
  const db = drizzle(neon(url))
  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('✓ migrations applied')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
