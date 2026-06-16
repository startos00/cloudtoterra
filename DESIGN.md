# Design

## Visual Theme

**Field atlas / survey notebook.** Warm bone "paper" surfaces, sepia ink, hairline rules, faint
topographic contour + graticule motifs, mono coordinate labels, survey-marker pins. Light theme
(a paper map is read in daylight; it must feel printed, civic, and open — not a dark dashboard).
Color strategy: **committed-restrained** — paper + ink dominate the surface; a cartographic legend
triad (clay / ochre / moss) carries the three node types; one ember accent marks "activation" and
primary actions. The "cloud to land" thesis appears as a restrained vertical wash (cool cloud →
warm terra) in the hero and major transitions only.

**Lane guardrail.** This is the *cartographic/atlas* lane, NOT editorial-typographic. Differentiate
with real map elements — graticule grids, contour linework, survey markers, a working legend, the
cloud→land wash — plus committed colour (the clay/ochre/moss triad + ember). Do NOT collapse into
the saturated "display-serif + mono-labels + monochromatic restraint" magazine look.

## Color Palette

All OKLCH. Neutrals are tinted warm (toward the ink hue); never pure #000/#fff.

Surfaces & ink:
- `--paper`        oklch(0.972 0.008 83)   — primary surface (warm bone)
- `--paper-raised` oklch(0.945 0.010 83)   — raised panels, map chrome
- `--paper-sunk`   oklch(0.915 0.012 83)   — insets, code/coordinate strips
- `--ink`          oklch(0.255 0.018 55)   — primary text, ink buttons (NOT black)
- `--ink-2`        oklch(0.435 0.015 58)   — secondary text
- `--ink-3`        oklch(0.560 0.012 60)   — muted labels, captions
- `--line`         oklch(0.255 0.018 55 / 0.16) — hairline rules/borders
- `--line-strong`  oklch(0.255 0.018 55 / 0.34) — emphasized frame lines

Cartographic legend triad (the three node types — keep in sync with src/lib/ui.ts):
- `--land`     oklch(0.66 0.095 80)  — ochre  (was #7c6f5a → warmer survey ochre)
- `--building` oklch(0.585 0.125 48) — clay   (≈ existing #b5651d)
- `--civic`    oklch(0.520 0.070 140) — moss

Accent & thesis:
- `--ember`  oklch(0.605 0.155 42)   — primary action / "activation" highlight (single accent)
- `--cloud`  oklch(0.895 0.013 235)  — sky/top of the cloud→land wash
- `--terra`  oklch(0.86 0.030 78)    — earth/bottom of the wash

Condition ramp (distress, usable→derelict): moss → ochre → clay → ember/rust, used for the density
heatmap and condition chips. Derive from the tokens above; do not introduce new hues.

State: focus ring = `--ember` at 2px offset; error = oklch(0.55 0.17 28); success = `--civic`.

## Typography

Chosen against reflex (Fraunces / Inter / IBM Plex Mono are training-data defaults — avoided). The
voice is "surveyor's field notebook + civic nameplate": crafted, public, precise — not magazine.

- **Display / headings — Bricolage Grotesque** (variable; wght 500–700, opsz). A contemporary
  grotesque with slight irregularity — reads crafted and plotted, not magazine-serif. Carries the
  cartographic title block. Fallback: "Hanken Grotesk", system-ui, sans-serif.
- **Body + labels + UI — Public Sans** (USWDS; wght 400–600). The US government's open civic
  typeface — literally the face of public infrastructure, so it earns its place here rather than
  arriving by reflex. Body 16px / line-height 1.6 / measure ≤68ch. Survey-label voice = Public Sans
  uppercase, letter-spacing 0.12–0.16em, `--ink-3`. Coordinates = Public Sans with
  `font-variant-numeric: tabular-nums` (a real grid reference, never mono costume).
  Fallback: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif.
- **Two families only** (display + civic sans). No third "technical mono" — so mono never becomes
  costume (a brand ban).
- Delivered via a Google Fonts `<link>` in the root layout (runtime; system fallbacks) so the
  production build never blocks on a font fetch.
- Scale (≥1.25, fluid `clamp()` on headings): 12 / 13 / 15 / 18 / 22 / 28 / 36 / 48 / 64. Hierarchy
  via Bricolage size + weight against tracked Public Sans labels; never a flat scale.

## Components

- **Title block / cartouche**: page + section headers framed like a map's title block — a hairline
  rule, a mono coordinate/label line, then a Fraunces title.
- **Hairlines over shadows**: dividers and panel edges are 1px `--line`. Avoid drop-shadowed cards;
  use paper layering (`--paper-raised` on `--paper`) and full hairline borders. No nested cards.
- **Legend key**: the Land/Building/Civic triad renders as a real map legend (swatch + glyph +
  mono label), reused on landing, filters, and about.
- **Survey-marker pins**: map markers read as survey markers (ring + glyph), colour = type, glyph
  disambiguates (already keyboard-operable).
- **Buttons**: primary = solid `--ink` text on paper turning to ink-filled on hover, or `--ember`
  fill for the single key CTA; crisp radius 3px (atlas precision), never full pills. Secondary =
  hairline outline. Mono labels for utility buttons.
- **Coordinate strip / chips**: small mono uppercase chips with hairline borders on `--paper-sunk`.
- **Contour / graticule motif**: a faint (4–7% ink) SVG contour or graticule behind heroes and
  empty states. Subtle; never competes with content.

## Layout

- Generous outer margins; content measure 68ch; asymmetric vertical rhythm (vary section padding,
  no uniform spacing). Map view stays full-bleed with floating paper chrome panels.
- Header reads as a map frame: wordmark left (Cloud·to·Terra with a hairline + coordinate tagline),
  nav right in mono.
- Hero: the cloud→land vertical wash with a faint graticule, Fraunces headline, one ember CTA.

## Motion

- Ease-out only (ease-out-expo / quart). No bounce/elastic. Durations 180–420ms.
- Signature: **plot/draw** — hero contour/graticule lines draw in (stroke-dashoffset); markers and
  content fade-up 12px on reveal. Never animate layout properties.
- Honor `prefers-reduced-motion`: disable draw + fades, show final state.
