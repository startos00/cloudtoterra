import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // pglite spins up a Postgres WASM per test file (~3-4s first query); the default
    // 5s timeout flakes under concurrent load. Give DB-backed tests real headroom.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
})
