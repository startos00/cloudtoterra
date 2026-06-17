import { z } from 'zod'
import type { NodeType } from './taxonomy'

// A safe, declarative parametric massing spec. Claude emits JSON matching this
// (no executable code); the Three.js viewer interprets only these known primitives.
// Units are metres, ground at y=0, pos is the element's [x, baseY, z] (base centre).
const Vec3 = z.tuple([z.number(), z.number(), z.number()])

export const ElementSchema = z.object({
  kind: z.enum(['box', 'gable', 'cylinder', 'terrain']),
  pos: Vec3.optional(),
  size: Vec3.optional(), // box/gable: [width, height, depth]
  radius: z.number().min(0.1).max(40).optional(), // cylinder
  height: z.number().min(0.1).max(120).optional(), // cylinder
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  // terrain: parcel topography (heightfield over the footprint, sampled from real elevation)
  cols: z.number().int().min(2).max(48).optional(),
  rows: z.number().int().min(2).max(48).optional(),
  points: z.array(Vec3).max(2304).optional(), // grid points [x,y,z], row-major (rows × cols)
  ring: z.array(z.tuple([z.number(), z.number()])).max(512).optional(), // footprint [x,z] for masking + outline
})
export type Element = z.infer<typeof ElementSchema>

export const BuildingSpecSchema = z.object({
  summary: z.string().max(240),
  storeys: z.number().int().min(1).max(80).optional(),
  elements: z.array(ElementSchema).min(1).max(18),
  groundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})
export type BuildingSpec = z.infer<typeof BuildingSpecSchema>

export type GenInput = {
  type: NodeType
  subType: string
  condition: string | null
  nodeName: string
  description: string | null
  boundary?: unknown // GeoJSON polygon (land) — drives parcel topography
}

const STOREY_H = 3.2
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

// Deterministic massing generator — used as the fallback when no LLM key is set,
// and as the schema/shape reference for the LLM.
export function specFromNode(n: GenInput): BuildingSpec {
  const d = (n.description ?? '').toLowerCase()
  const text = `${d} ${n.subType}`

  // storeys: explicit "N-storey/floor" wins, else a sensible default per type
  const m = text.match(/(\d{1,2})[\s-]*(storey|story|floor|storeys|stories|floors)/)
  const defaultStoreys = n.type === 'civic' ? 2 : n.type === 'society' ? 2 : n.type === 'land' ? 0 : 3
  const storeys = clamp(m ? parseInt(m[1], 10) : defaultStoreys, n.type === 'land' ? 0 : 1, 60)
  const dark = '#1b1b1b'

  if (n.type === 'land') {
    // a flat parcel slab
    return {
      summary: `Parcel massing for ${n.nodeName}`,
      elements: [{ kind: 'box', pos: [0, 0, 0], size: [8, 0.3, 7], color: '#2c52ff' }],
      groundColor: '#e9e6dd',
    }
  }

  // footprint by sub-type / keywords
  let w = 5, depth = 4
  if (/mill|warehouse|industrial|factory|shed|hangar/.test(text)) { w = 12; depth = 5 }
  else if (/office|tower|commercial/.test(text)) { w = 4.5; depth = 4.5 }
  else if (/walkup|estate|apartment|flat|block/.test(text)) { w = 8; depth = 5 }
  else if (/house|single|home|cottage/.test(text)) { w = 5; depth = 4.5 }
  else if (n.type === 'civic') { w = 7; depth = 5 }

  const h = clamp(storeys * STOREY_H, 2.5, 200)
  const elements: Element[] = []

  // main mass
  elements.push({ kind: 'box', pos: [0, 0, 0], size: [w, h, depth], color: dark })

  // roof: pitched for houses / civic / religious; flat otherwise
  const pitched = /house|single|home|cottage|gable|pitched|church|chapel|temple/.test(text) || n.subType === 'religious'
  if (pitched) {
    elements.push({ kind: 'gable', pos: [0, h, 0], size: [w, Math.min(2.4, w * 0.4), depth], color: dark })
  }
  // religious spire
  if (/church|chapel|temple|spire|steeple/.test(text) || n.subType === 'religious') {
    elements.push({ kind: 'box', pos: [-w * 0.32, 0, -depth * 0.2], size: [1.2, h + 4, 1.2], color: dark })
  }
  // industrial chimney / hoist tower
  if (/chimney|smokestack|stack/.test(text)) {
    elements.push({ kind: 'cylinder', pos: [w * 0.4, 0, -depth * 0.3], radius: 0.7, height: h + 5, color: dark })
  } else if (/hoist|tower|silo|water tower/.test(text)) {
    elements.push({ kind: 'box', pos: [w * 0.38, 0, depth * 0.25], size: [1.6, h + 2.5, 1.6], color: dark })
  }
  // civic portico (a low wing in front)
  if (n.type === 'civic' && !pitched) {
    elements.push({ kind: 'box', pos: [0, 0, depth * 0.7], size: [w * 0.9, h * 0.45, 1.4], color: dark })
  }
  // a long mill is really a low shed: flatten if many bays
  return {
    summary: `${storeys}-storey ${n.subType.replace(/_/g, ' ')} massing for ${n.nodeName}`,
    storeys,
    elements,
    groundColor: '#e9e6dd',
  }
}
