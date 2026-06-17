import type { PublicNode } from './ui'

// Curated "pre-nodes": notable network societies / startup societies, seeded so the map and
// archive have real content before any crowd submission. Coordinates are approximate.
// These are always shown alongside approved crowd nodes; they are not user-editable.
export type PreNode = PublicNode & { source: 'curated' }

export const PRE_NODES: PreNode[] = [
  {
    id: 'pre-network-school', type: 'society', subType: 'startup_society', condition: null,
    nodeName: 'Network School', city: 'Forest City, Johor SEZ', country: 'MY',
    latitude: 1.4187, longitude: 103.6334, photoUrls: null, source: 'curated',
    description: 'A startup society materialising internet communities into a physical campus, set within the dormant Forest City development.',
  },
  {
    id: 'pre-prospera', type: 'society', subType: 'charter_city', condition: null,
    nodeName: 'Próspera', city: 'Roatán, Honduras', country: 'HN',
    latitude: 16.3010, longitude: -86.5340, photoUrls: null, source: 'curated',
    description: 'A startup city operating under its own legal, tax, and governance framework on the island of Roatán.',
  },
  {
    id: 'pre-culdesac', type: 'society', subType: 'intentional_community', condition: null,
    nodeName: 'Culdesac Tempe', city: 'Tempe, Arizona', country: 'US',
    latitude: 33.4140, longitude: -111.9260, photoUrls: null, source: 'curated',
    description: 'A purpose-built car-free neighbourhood, an intentional community reactivating walkable urban living.',
  },
  {
    id: 'pre-cabin', type: 'society', subType: 'network_state', condition: null,
    nodeName: 'Cabin', city: 'Austin, Texas', country: 'US',
    latitude: 30.2672, longitude: -97.7431, photoUrls: null, source: 'curated',
    description: 'A network of neighbourhoods knitting remote communities into shared physical places.',
  },
  {
    id: 'pre-zuzalu', type: 'society', subType: 'startup_society', condition: null,
    nodeName: 'Zuzalu (legacy)', city: 'Tivat, Montenegro', country: 'ME',
    latitude: 42.4360, longitude: 18.7030, photoUrls: null, source: 'curated',
    description: 'The 2023 pop-up village that seeded the network-society movement; the prototype gathering.',
  },
  {
    id: 'pre-edge-esmeralda', type: 'society', subType: 'startup_society', condition: null,
    nodeName: 'Edge Esmeralda', city: 'Healdsburg, California', country: 'US',
    latitude: 38.6100, longitude: -122.8690, photoUrls: null, source: 'curated',
    description: 'A month-long pop-up society prototyping the town its community wants to build.',
  },
]
