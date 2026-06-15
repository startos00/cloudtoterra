import type { NodeType, Condition } from './taxonomy'

export const TYPE_COLORS: Record<NodeType, string> = {
  land: '#7c6f5a',
  building: '#b5651d',
  civic: '#8a6d3b',
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
