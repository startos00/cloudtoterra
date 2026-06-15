// Single source of truth for the CloudtoTerra pin-drop taxonomy.
// 3 top-level types; sub-types per type; condition is a separate axis (filter).

export const NODE_TYPES = ['land', 'building', 'civic'] as const
export type NodeType = (typeof NODE_TYPES)[number]

export const SUB_TYPES = {
  land: ['vacant_lot', 'brownfield', 'greyfield', 'infill', 'strategic', 'agricultural_edge'],
  building: [
    // whole-building
    'residential_walkup', 'residential_single_family', 'residential_estate',
    'commercial_office', 'commercial_retail', 'commercial_industrial_mill', 'commercial_hospitality',
    // within-building (partial spaces — offices / units, not the whole building)
    'office_unit', 'retail_unit', 'floor_suite', 'studio_workshop', 'hall_room',
  ],
  civic: ['government', 'religious', 'educational', 'cultural', 'military', 'associational'],
} as const satisfies Record<NodeType, readonly string[]>

export const CONDITIONS = ['usable', 'dormant', 'distressed', 'derelict'] as const
export type Condition = (typeof CONDITIONS)[number]

export const SOCIETY_TAGS = ['meetup', 'collective', 'dao', 'community_group', 'event'] as const
export type SocietyTag = (typeof SOCIETY_TAGS)[number]

export function isValidSubType(type: string, sub: string): boolean {
  return (SUB_TYPES as Record<string, readonly string[]>)[type]?.includes(sub) ?? false
}
