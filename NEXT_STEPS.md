# CloudtoTerra — your morning action list

P1 (the crowd-map core) is **built, committed locally, and verified** (35 commits of green
tests + clean typecheck/lint + a passing production build). Everything below needs *you* —
it's outward-facing, costs money, or requires your accounts. I deliberately did none of it.

## Must do to go live  (each needs your accounts / payment — I can't do these for you)

1. **Domain — DONE ✅** `cloudtoterra.com` is registered on Cloudflare. The app's
   `NEXT_PUBLIC_APP_URL`, sitemap, and robots already point at it. Only remaining domain step is
   attaching it to the Vercel project (step 8).

2. **Push to GitHub** (public — it's AGPL); the repo is local-only right now:
   ```bash
   cd ~/dev/cloudtoterra
   gh repo create cloudtoterra --public --source=. --remote=origin --push
   ```

3. **Finish the LICENSE** (only the AGPL header is in; network was blocked here):
   ```bash
   curl -fsSL https://www.gnu.org/licenses/agpl-3.0.txt >> LICENSE
   ```

4. **Provision a Neon Postgres DB** → set `DATABASE_URL` (Vercel + `.env.local`), then migrate:
   ```bash
   pnpm db:migrate          # applies drizzle/0000_* and 0001_* (adds model_3d_url + featured)
   pnpm db:seed             # optional demo nodes
   ```
   Without `DATABASE_URL` the app uses an in-memory dev DB (fine locally; resets on restart).

5. **Create a Vercel Blob store** (project → Storage → Blob) for property photos. Linking it sets
   `BLOB_READ_WRITE_TOKEN` automatically; then set `NEXT_PUBLIC_BLOB_ENABLED=1` so the browser uploads
   photos to Blob. Without it, photos fall back to inline base64 (works, but not for scale).

6. **Set real admin secrets** (Vercel env + local) — current values are dev placeholders
   (`changeme-dev` / `dev-secret-change-me-please`):
   ```bash
   openssl rand -base64 32   # → ADMIN_SESSION_SECRET ; pick a strong ADMIN_PASSWORD
   ```

7. **Deploy to Vercel** (new project, separate from Nubis) with env vars:
   `DATABASE_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`,
   `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_BLOB_ENABLED=1`, `NEXT_PUBLIC_APP_URL=https://cloudtoterra.com`.
   Deploy via **git push** (your memory note: the local `vercel` CLI gets SIGKILLed by the memory-monitor).

8. **Attach the domain** in Vercel → Project → Domains → add `cloudtoterra.com`, then set the DNS
   records Vercel shows at your registrar (or point nameservers if using Cloudflare Registrar).

### Featured properties + 3D models
Detail pages (`/node/[id]`) render a Three.js view: an uploaded **GLB** when present, otherwise a
procedural massing built from the property (land extrudes its drawn footprint). To feature a property
with your own model: host the `.glb` (the Blob store or any public URL), then in `/admin` paste the
**3D model URL** and tick **Featured** when you approve it. (AI auto-generation of a three.js scene
from property detail is a later step — the procedural massing is the deterministic v1.)

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
