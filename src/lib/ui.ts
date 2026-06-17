import type { NodeType, Condition } from './taxonomy'

// Monochrome system — node types are distinguished by glyph/letter, accent for active.
export const TYPE_COLORS: Record<NodeType, string> = {
  land: '#111111',
  building: '#111111',
  civic: '#111111',
  society: '#111111',
}

export const TYPE_LABELS: Record<NodeType, string> = {
  land: 'Land',
  building: 'Building',
  civic: 'Civic Asset',
  society: 'Society',
}

// single-letter tags used inside monochrome map pins
export const TYPE_LETTER: Record<NodeType, string> = {
  land: 'L',
  building: 'B',
  civic: 'C',
  society: 'S',
}

export const TYPE_EMOJI: Record<NodeType, string> = {
  land: '🟫',
  building: '🏚️',
  civic: '🏛️',
  society: '👥',
}

// Lightweight shape the client UI consumes (subset of the DB row).
export type PublicNode = {
  id: string
  type: NodeType
  subType: string
  condition: Condition | null
  nodeName: string
  description: string | null
  latitude: number
  longitude: number
  photoUrls: string[] | null
  city: string | null
  country: string | null
}

const SUB_ACRONYMS = new Set(['sez', 'dao', 'id'])
export function prettySub(sub: string): string {
  return sub.split('_').map((w) => (SUB_ACRONYMS.has(w) ? w.toUpperCase() : w)).join(' ')
}
