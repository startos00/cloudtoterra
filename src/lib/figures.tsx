import type { ReactNode } from 'react'
import type { NodeType } from './taxonomy'

export type Glow = 'orange' | 'purple' | 'blue' | 'magenta' | 'green'
export const GLOW_RGB: Record<Glow, string> = {
  orange: '255,149,0',
  purple: '157,78,221',
  blue: '0,140,255',
  magenta: '255,0,128',
  green: '0,176,118',
}

export type Figure = { id: string; fig: string; type: NodeType; label: string; glow: Glow; blurb: string; icon: ReactNode }

const L = { stroke: 'currentColor', strokeWidth: 5, fill: 'none', strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const FILL = { fill: 'currentColor', stroke: 'none' }
const DET = 'opacity-0 transition-opacity duration-300 group-hover:opacity-100'

// Each icon is the inner content of a <svg viewBox="0 0 100 100">.
export const FIGURES: Figure[] = [
  // ── LAND ─────────────────────────────────────────────
  {
    id: 'land-vacant', fig: 'FIG. 001', type: 'land', label: 'Vacant Lot', glow: 'green',
    blurb: 'Cleared or never-built ground waiting for a first use.',
    icon: (<>
      <rect x="18" y="18" width="64" height="64" rx="2" style={{ ...L, strokeDasharray: '7 7' }} />
      <g className={DET}><line x1="50" y1="58" x2="50" y2="42" {...L} /><line x1="42" y1="50" x2="58" y2="50" {...L} /></g>
    </>),
  },
  {
    id: 'land-brownfield', fig: 'FIG. 002', type: 'land', label: 'Brownfield', glow: 'orange',
    blurb: 'Former industrial land, likely needing cleanup before reuse.',
    icon: (<>
      <rect x="16" y="16" width="68" height="68" {...L} />
      <g className={DET}>{[30, 44, 58, 72].map((o) => <line key={o} x1="18" y1={o} x2={o + 12} y2="82" {...L} strokeWidth={3} />)}</g>
    </>),
  },
  {
    id: 'land-infill', fig: 'FIG. 003', type: 'land', label: 'Infill', glow: 'blue',
    blurb: 'A gap between buildings ready for one new structure.',
    icon: (<>
      <rect x="12" y="24" width="22" height="52" style={FILL} />
      <rect x="66" y="24" width="22" height="52" style={FILL} />
      <rect x="40" y="24" width="20" height="52" {...L} />
      <rect x="40" y="24" width="20" height="52" className={DET} style={FILL} />
    </>),
  },
  // ── BUILDING ─────────────────────────────────────────
  {
    id: 'bldg-walkup', fig: 'FIG. 004', type: 'building', label: 'Walk-up', glow: 'purple',
    blurb: 'Low-rise flats, ripe for whole-block reactivation.',
    icon: (<>
      <rect x="22" y="38" width="56" height="46" {...L} />
      <line x1="22" y1="54" x2="78" y2="54" {...L} strokeWidth={3} /><line x1="22" y1="70" x2="78" y2="70" {...L} strokeWidth={3} />
      <line x1="40" y1="38" x2="40" y2="84" {...L} strokeWidth={3} /><line x1="60" y1="38" x2="60" y2="84" {...L} strokeWidth={3} />
    </>),
  },
  {
    id: 'bldg-house', fig: 'FIG. 005', type: 'building', label: 'House', glow: 'green',
    blurb: 'Detached or terrace homes ready for a new household.',
    icon: (<>
      <path d="M18 50 L50 26 L82 50" {...L} />
      <rect x="28" y="50" width="44" height="34" {...L} />
      <rect x="44" y="66" width="12" height="18" {...L} strokeWidth={3} />
      <rect x="34" y="58" width="10" height="10" {...L} strokeWidth={2.5} />
      <g className={DET}><rect x="58" y="58" width="10" height="10" {...L} strokeWidth={2.5} /><line x1="66" y1="38" x2="66" y2="30" {...L} strokeWidth={3} /></g>
    </>),
  },
  {
    id: 'bldg-office', fig: 'FIG. 006', type: 'building', label: 'Office', glow: 'blue',
    blurb: 'Empty office floors convertible to homes or studios.',
    icon: (<>
      <rect x="34" y="14" width="34" height="72" {...L} />
      {[24, 38, 52, 66].map((y) => [42, 52].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" {...L} strokeWidth={2.5} />))}
      <g className={DET}><rect x="42" y="38" width="8" height="8" style={FILL} /><rect x="52" y="52" width="8" height="8" style={FILL} /><rect x="42" y="66" width="8" height="8" style={FILL} /></g>
    </>),
  },
  {
    id: 'bldg-hotel', fig: 'FIG. 007', type: 'building', label: 'Hotel', glow: 'magenta',
    blurb: 'Tired or shuttered hotels: rooms, kitchens, licences intact.',
    icon: (<>
      <rect x="26" y="22" width="48" height="62" {...L} />
      {[30, 42, 54].map((y) => [34, 46, 58].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" {...L} strokeWidth={2.5} />))}
      <rect x="44" y="70" width="12" height="14" {...L} strokeWidth={3} />
      <path d="M38 70 L44 62 L56 62 L62 70" {...L} strokeWidth={3} />
      <g className={DET}><rect x="34" y="42" width="8" height="8" style={FILL} /><rect x="58" y="30" width="8" height="8" style={FILL} /></g>
    </>),
  },
  {
    id: 'bldg-mill', fig: 'FIG. 008', type: 'building', label: 'Industrial Mill', glow: 'orange',
    blurb: 'Big-span mills and warehouses for makers and events.',
    icon: (<>
      <rect x="14" y="50" width="72" height="34" {...L} />
      <path d="M14 50 L26 38 L26 50 M38 50 L50 38 L50 50 M62 50 L74 38 L74 50" {...L} strokeWidth={3} />
    </>),
  },
  {
    id: 'bldg-unit', fig: 'FIG. 009', type: 'building', label: 'Office Unit', glow: 'magenta',
    blurb: 'A single tenancy or floor, not the whole building.',
    icon: (<>
      {[20, 36, 52, 68].map((y) => <rect key={y} x="26" y={y} width="48" height="14" {...L} strokeWidth={3} />)}
      <rect x="26" y="36" width="48" height="14" className={DET} style={FILL} />
    </>),
  },
  // ── CIVIC ────────────────────────────────────────────
  {
    id: 'civic-gov', fig: 'FIG. 010', type: 'civic', label: 'Government', glow: 'blue',
    blurb: 'Surplus civic buildings: post offices, courthouses, halls.',
    icon: (<>
      <path d="M18 40 L50 20 L82 40" {...L} />
      {[30, 42, 58, 70].map((x) => <line key={x} x1={x} y1="46" x2={x} y2="76" {...L} strokeWidth={4} />)}
      <line x1="16" y1="82" x2="84" y2="82" {...L} />
    </>),
  },
  {
    id: 'civic-religious', fig: 'FIG. 011', type: 'civic', label: 'Religious', glow: 'purple',
    blurb: 'Deconsecrated churches and temples seeking new life.',
    icon: (<>
      <path d="M30 84 V46 L50 30 L70 46 V84" {...L} />
      <line x1="50" y1="30" x2="50" y2="12" {...L} strokeWidth={4} /><line x1="42" y1="18" x2="58" y2="18" {...L} strokeWidth={4} />
    </>),
  },
  {
    id: 'civic-cultural', fig: 'FIG. 012', type: 'civic', label: 'Cultural', glow: 'magenta',
    blurb: 'Theatres, baths, and halls built with public money.',
    icon: (<>
      <path d="M20 82 V44 Q50 18 80 44 V82" {...L} />
      <g className={DET}><line x1="38" y1="50" x2="38" y2="82" {...L} strokeWidth={3} /><line x1="62" y1="50" x2="62" y2="82" {...L} strokeWidth={3} /></g>
    </>),
  },
  {
    id: 'civic-military', fig: 'FIG. 013', type: 'civic', label: 'Military', glow: 'green',
    blurb: 'Armouries and drill halls: vast, fortress-built spaces.',
    icon: (<>
      <path d="M20 84 V40 H32 V32 H44 V40 H56 V32 H68 V40 H80 V84 Z" {...L} />
    </>),
  },
  // ── SOCIETY ──────────────────────────────────────────
  {
    id: 'soc-startup', fig: 'FIG. 014', type: 'society', label: 'Startup Society', glow: 'orange',
    blurb: 'An internet community materialising into a real place.',
    icon: (<>
      <g className={DET}><line x1="28" y1="34" x2="64" y2="26" {...L} strokeWidth={3} /><line x1="64" y1="26" x2="74" y2="64" {...L} strokeWidth={3} /><line x1="74" y1="64" x2="38" y2="72" {...L} strokeWidth={3} /><line x1="38" y1="72" x2="28" y2="34" {...L} strokeWidth={3} /><line x1="28" y1="34" x2="74" y2="64" {...L} strokeWidth={3} /></g>
      {[[28, 34], [64, 26], [74, 64], [38, 72]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6" style={FILL} />)}
    </>),
  },
  {
    id: 'soc-charter', fig: 'FIG. 015', type: 'society', label: 'Charter City', glow: 'blue',
    blurb: 'A new jurisdiction with its own rules and governance.',
    icon: (<>
      <rect x="18" y="18" width="64" height="64" {...L} />
      <line x1="18" y1="50" x2="40" y2="50" {...L} strokeWidth={3} /><line x1="60" y1="50" x2="82" y2="50" {...L} strokeWidth={3} />
      <line x1="50" y1="18" x2="50" y2="82" {...L} strokeWidth={3} />
      <rect x="42" y="42" width="16" height="16" className={DET} style={FILL} />
    </>),
  },
  {
    id: 'soc-coliving', fig: 'FIG. 016', type: 'society', label: 'Co-living', glow: 'purple',
    blurb: 'Shared housing run as one intentional community.',
    icon: (<>
      <path d="M20 50 L50 24 L80 50 V84 H20 Z" {...L} />
      <line x1="50" y1="50" x2="50" y2="84" {...L} strokeWidth={3} /><line x1="20" y1="66" x2="80" y2="66" {...L} strokeWidth={3} />
    </>),
  },
  {
    id: 'soc-dao', fig: 'FIG. 017', type: 'society', label: 'DAO', glow: 'magenta',
    blurb: 'An on-chain collective coordinating real-world ground.',
    icon: (<>
      <polygon points="50,16 80,33 80,67 50,84 20,67 20,33" {...L} />
      <g className={DET}>{[[50, 16], [80, 33], [80, 67], [50, 84], [20, 67], [20, 33]].map(([x, y], i) => <line key={i} x1="50" y1="50" x2={x} y2={y} {...L} strokeWidth={2.5} />)}</g>
      <circle cx="50" cy="50" r="6" style={FILL} />
    </>),
  },
]
