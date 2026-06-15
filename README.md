# CloudtoTerra

**From cloud to land** — an open, public-good crowd map of dormant, distressed, and underused
urban assets (land, buildings, civic assets) waiting to be reactivated.

Anyone can drop a pin (and draw a boundary for land). Submissions are **gated**: hidden until an
admin approves them. Approved data is a free commons (CC-BY-4.0) and a curated subset can feed the
commercial **Nubis** intelligence platform.

CloudtoTerra is the public-good sibling of [Nubis](https://nubis.land).

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Mapbox GL JS + mapbox-gl-draw ·
Drizzle ORM + Neon Postgres · zod · Vitest (+ pglite for in-process DB tests).

## Pin-drop model

Three types — **Land · Building · Civic Asset** — each with a sub-type and a **condition**
(`usable → dormant → distressed → derelict`). Partial spaces (a vacant office/unit) are Building
sub-types. "Society/community" is a filter/tag + a background layer, not a pin type.
(See `docs` in the facility-broker repo for the full spec/plan.)

## Local development

```bash
pnpm install
cp .env.example .env.local     # then fill in values (see below)
pnpm db:generate               # generate migration (already committed)
pnpm db:migrate                # apply to your Neon DB (needs DATABASE_URL)
pnpm dev                       # http://localhost:3000
```

### Environment (`.env.local`)

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Public Mapbox token (renders the map) |
| `DATABASE_URL` | Neon Postgres connection string (submit/list/admin) |
| `ADMIN_PASSWORD` | Password for `/admin` login |
| `ADMIN_SESSION_SECRET` | Secret used to sign the admin cookie + hash IPs |

The map renders with just the Mapbox token; submitting/approving needs `DATABASE_URL`.

## Scripts

| Command | What |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm test` | Vitest (unit + pglite integration) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm db:generate` / `db:migrate` | Drizzle migrations |
| `pnpm db:seed` | Insert demo nodes (`DATABASE_URL=... pnpm db:seed`) |

## How it works

```
visitor drops pin / draws boundary → POST /api/nodes (status=pending, hidden)
  → admin signs in at /admin → approve/reject
  → approved → is_visible=true → shows on the public map + /node/[id]
```

Anti-abuse: honeypot field, salted IP hash, per-IP rate window. Nothing is public until approved.

## Routes

- `/` landing · `/about` mission + license · `/map` the crowd map · `/node/[id]` shareable detail · `/admin` approval queue
- `GET/POST /api/nodes` · `GET/PATCH /api/nodes/[id]` · `POST/DELETE /api/admin/login`

## Deploy (Vercel)

1. Create a Vercel project from this repo (own project, separate from Nubis).
2. Set env vars: `NEXT_PUBLIC_MAPBOX_TOKEN`, `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
3. Provision a Neon Postgres DB; run `pnpm db:migrate` against it.
4. Connect the domain **cloudtoterra.land**.

## License

- **Code:** AGPL-3.0-or-later (see `LICENSE`).
- **Data:** CC-BY-4.0.

## Roadmap

- **P1 (this repo):** crowd map core — pin-drop, gated approval, public map. ✅
- **P2:** civic background overlays (institutional anchors, node score, distress density, demographics).
- **P3:** one-way curated sync feed into Nubis.
- Later: accounts/contributor profiles, voting/reputation, PostGIS spatial indexing.
