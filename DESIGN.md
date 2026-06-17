# Design

## Visual Theme

**Interactive field-atlas.** Black-on-white over a soft blue/violet **aurora**, with
**glassmorphism** panels, system **Helvetica**, and abstract **generative** diagrams (not literal
illustration). The atlas reads dormant ground as computational *field conditions* —
parcellation, flow, adjacency, aggregation — rather than drawing buildings. Node types are
monochrome, distinguished by a **letter glyph** (L/B/C/S), with one electric-blue accent for
interaction and "active/curated."

> User-directed overrides (their reference set wins over the usual rules): pure `#000`/`#fff` is
> intentional; glassmorphism is intentional and core, not decorative; fonts are system Helvetica
> (no web fonts). Do not "correct" these back to tinted neutrals / no-glass / a display typeface.

## Color

- `--paper` `#ffffff`, `--ink` `#000000` (pure, by direction).
- `--ink-2` `#303236`, `--ink-3` `#74777e` (secondary / muted).
- `--line` `#000000` hard 1px hairlines; `--ink/10–20` for soft dividers.
- `--accent` `#2c52ff` — electric blue. The single interactive accent: active states, links,
  selected map pin/inspector, curated ring, filter focus.
- **Aurora** (`.aurora`): layered radial gradients (blue `rgba(31,162,255)`, violet
  `rgba(139,140,248)`, blue `rgba(91,155,255)`) resolving to white at the bottom. Signature
  backdrop for landing, map chrome context, places, about, node.
- Node types are monochrome (`#111`); never colour-coded. Distinguish by `TYPE_LETTER`.

## Typography

- **System Helvetica** stack: `"Helvetica Neue", Helvetica, Arial, "Segoe UI", sans-serif`. All
  system fonts — no web-font fetch, so the build never blocks and there is no FOUT.
- Body 16px / line-height 1.45; headings `font-weight 600`, tight tracking, not force-uppercased.
- `.label` / `.meta` = uppercase, `letter-spacing 0.08em`, 0.65rem, the survey/journal voice.
- `.coord` = `tabular-nums` for coordinates (`1.419° N · 103.633° E`).
- Serif/mono tokens exist only as system fallbacks; the system is sans.

## Components

- **`.glass`** — translucent white + `backdrop-filter: blur(14px)` + hairline border + soft shadow.
  The core surface for floating panels (map), cards (archive), and content (about/node).
- **Hard borders** — 1px `#000` everywhere; crisp, no radius on chips/buttons.
- **`.btn-ink` / `.btn-ghost`** — uppercase Helvetica, 1px border; ink fills / ghost outlines;
  hover inverts (ink → accent, ghost → ink).
- **Map markers** — monochrome annotation pins (white disc, black border) with the type letter;
  curated pre-nodes get an accent-blue ring; selected pin fills accent.
- **Glass inspector** — click a pin → glass panel (type, coordinates, condition, description,
  Open-detail for crowd nodes).
- **Generative stage figures** (landing) — four cursor-reactive canvas systems: Parcellation
  (recursive subdivision), Flow (streamline vortex), Adjacency (proximity network), Aggregation
  (circle-packing). Driven by Grain/Scale sliders + cursor. Abstract, never literal.
- **Sliders** — hairline track, thin tick thumb. **Chips** — bordered uppercase tags.

## Layout

- **Landing** — two-panel field index: left index (figure thumbnails A–D + parameter sliders +
  CTAs), right interactive stage + justified field-condition caption; on the aurora.
- **Map** — full-bleed light mercator basemap; floating glass panels (count, Layers/Condition/
  Overlays, ADD bar) + glass inspector; annotation-pin nodes incl. curated society pre-nodes.
- **Places** — glass archive grid: giant count + search + type filter toolbar + glass cards.
- **About / Node** — glass content card on the aurora; hairline-ruled sections; letter-badge legend.
- App masthead is a thin system-sans bar (wordmark + nav).

## Motion

- Interactivity lives in the generative canvases (cursor-reactive, slider-driven) and the map
  inspector. Subtle `.rise` reveal on first paint. Ease-out only; honour `prefers-reduced-motion`.
- No decorative entrance choreography; the systems themselves are the motion.
