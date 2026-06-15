# CloudtoTerra — your morning action list

P1 (the crowd-map core) is **built, committed locally, and verified** (35 commits of green
tests + clean typecheck/lint + a passing production build). Everything below needs *you* —
it's outward-facing, costs money, or requires your accounts. I deliberately did none of it.

## Must do to go live

1. **Buy the domain** — `cloudtoterra.land` (verify availability at a registrar).
2. **Create the GitHub repo** (public, since it's open source) and push — the repo is local-only right now:
   ```bash
   cd ~/dev/cloudtoterra
   gh repo create cloudtoterra --public --source=. --remote=origin --push   # or set your own remote
   ```
3. **Complete the LICENSE** — only the AGPL notice header was written (network fetch was blocked):
   ```bash
   curl -fsSL https://www.gnu.org/licenses/agpl-3.0.txt >> LICENSE
   ```
4. **Provision a Neon Postgres DB**, put its URL in `.env.local` as `DATABASE_URL`, then:
   ```bash
   pnpm db:migrate          # applies drizzle/0000_*.sql
   DATABASE_URL=... pnpm db:seed   # optional: 8 demo nodes
   ```
5. **Set real admin secrets** in `.env.local` (and Vercel):
   ```bash
   openssl rand -base64 32   # use for ADMIN_SESSION_SECRET; pick a strong ADMIN_PASSWORD
   ```
6. **Deploy to Vercel** — new project from the repo (separate from Nubis), set the 4 env vars,
   then attach `cloudtoterra.land`. (Per your memory note, deploy via git push, not the local
   `vercel` CLI — the memory-monitor LaunchAgent SIGKILLs CLI uploads.)

## Run it locally right now

```bash
cd ~/dev/cloudtoterra
pnpm dev        # http://localhost:3000  — map renders (token already in .env.local)
```
The map + landing + about work immediately. Submitting/approving needs `DATABASE_URL` set.
(Note: your memory-monitor LaunchAgent may SIGKILL `next dev`/Turbopack locally — the production
build worked fine here, and Vercel is unaffected.)

## Decisions I made autonomously (flagging for your review)

- **Next 16 / React 19 / Tailwind v4**, not Next 14 — the spec said 14, but that came from the
  stale CLAUDE.md; live Nubis is on 16, and 16 is what's compatible with your Node 26. "Match Nubis"
  → matched the real stack.
- **PostGIS deferred to P2** — P1 uses plain `lat/lng` + `jsonb` boundary so the whole thing is
  testable in-process (pglite) without provisioning a DB. Functionally identical for the map.
- **AGPL (code) + CC-BY (data)** and **ship-P1-first** — locked per my recommendation when you said "all good".
- Copied your **public** `NEXT_PUBLIC_MAPBOX_TOKEN` into `.env.local` (gitignored) for convenience.

## What's built (P1)

- 3-type gated crowd map: Land / Building / Civic + condition filter
- Pin-drop + draw-boundary (land) → SubmissionModal → `pending`
- Admin login + approval queue (`/admin`) → approve flips to public
- Shareable node detail (`/node/[id]`), landing, about
- Anti-abuse: honeypot + salted IP hash + per-IP rate window
- 25 tests (unit + pglite integration), tsc clean, lint clean, production build green

## What's next (separate plans)

- **P2** — civic background overlays (institutional anchors, node score, distress density, demographics)
- **P3** — one-way curated sync feed into Nubis (`/api/ingestion/*` seam already exists there)
- Later — accounts/profiles, voting/reputation, PostGIS spatial indexing

Spec + plan live in the facility-broker repo:
`docs/superpowers/specs/2026-06-16-cloudtoterra-design.md` ·
`docs/superpowers/plans/2026-06-16-cloudtoterra-p1-crowd-map-core.md`
