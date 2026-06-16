import type { NodeType, Condition } from './taxonomy'

// Kept in sync with the --color-{land,building,civic} tokens in globals.css / DESIGN.md.
export const TYPE_COLORS: Record<NodeType, string> = {
  land: 'oklch(0.66 0.095 80)',
  building: 'oklch(0.585 0.125 48)',
  civic: 'oklch(0.520 0.070 140)',
}

export const TYPE_LABELS: Record<NodeType, string> = {
  land: 'Land',
  building: 'Building',
  civic: 'Civic Asset',
}

export const TYPE_EMOJI: Record<NodeType, string> = {
  land: '🟫',
  building: '🏚️',
  civic: '🏛️',
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

export function prettySub(sub: string): string {
  return sub.replaceAll('_', ' ')
}
