import type { NodeRow } from './schema'

// Distress-density overlay: weight each node by how distressed its condition is.
export const CONDITION_WEIGHT: Record<string, number> = {
  derelict: 1,
  distressed: 0.75,
  dormant: 0.5,
  usable: 0.25,
}
export const DEFAULT_WEIGHT = 0.4

export type DensityPoint = Pick<NodeRow, 'latitude' | 'longitude' | 'condition'>

export type DensityFC = {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: { type: 'Point'; coordinates: [number, number] }
    properties: { weight: number }
  }>
}

export function densityFeatureCollection(nodes: DensityPoint[]): DensityFC {
  return {
    type: 'FeatureCollection',
    features: nodes.map((n) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [n.longitude, n.latitude] },
      properties: { weight: CONDITION_WEIGHT[n.condition ?? ''] ?? DEFAULT_WEIGHT },
    })),
  }
}
