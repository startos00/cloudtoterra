/* Demo seed — run with a real DB:  DATABASE_URL=... pnpm db:seed
   Inserts a handful of APPROVED, visible sample nodes. Idempotent. */
import { db } from '../lib/db'
import { nodes, type NewNode } from '../lib/schema'

const SAMPLES: NewNode[] = [
  { type: 'building', subType: 'commercial_industrial_mill', condition: 'distressed', nodeName: 'Larkin Soap Works Annex', city: 'Buffalo', country: 'US', latitude: 42.879, longitude: -78.858, status: 'approved', isVisible: true, description: 'Brick industrial block near the Larkin District.' },
  { type: 'civic', subType: 'religious', condition: 'dormant', nodeName: 'St. Adalbert Basilica (annex)', city: 'Buffalo', country: 'US', latitude: 42.905, longitude: -78.847, status: 'approved', isVisible: true, description: 'Underused parish hall beside the basilica.' },
  { type: 'land', subType: 'brownfield', condition: 'derelict', nodeName: 'Former Rail Yard Parcel', city: 'Buffalo', country: 'US', latitude: 42.872, longitude: -78.873, status: 'approved', isVisible: true, boundary: { type: 'Polygon', coordinates: [[[-78.874, 42.871], [-78.872, 42.871], [-78.872, 42.873], [-78.874, 42.873], [-78.874, 42.871]]] } },
  { type: 'civic', subType: 'cultural', condition: 'dormant', nodeName: 'Old Vaudeville Theatre', city: 'Youngstown', country: 'US', latitude: 41.099, longitude: -80.649, status: 'approved', isVisible: true, description: 'Shuttered downtown theatre with intact proscenium.' },
  { type: 'building', subType: 'commercial_office', condition: 'dormant', nodeName: 'Realty Building (upper floors)', city: 'Youngstown', country: 'US', latitude: 41.097, longitude: -80.650, status: 'approved', isVisible: true, description: 'Vacant office floors above an active ground floor.' },
  { type: 'civic', subType: 'educational', condition: 'distressed', nodeName: 'Former Elementary School No. 7', city: 'Youngstown', country: 'US', latitude: 41.105, longitude: -80.655, status: 'approved', isVisible: true },
  { type: 'land', subType: 'vacant_lot', condition: 'derelict', nodeName: 'Corner Infill Lot', city: 'Youngstown', country: 'US', latitude: 41.101, longitude: -80.652, status: 'approved', isVisible: true, boundary: { type: 'Polygon', coordinates: [[[-80.653, 41.100], [-80.651, 41.100], [-80.651, 41.102], [-80.653, 41.102], [-80.653, 41.100]]] } },
  { type: 'building', subType: 'office_unit', condition: 'dormant', nodeName: 'Vacant 3rd-floor suite, Main St', city: 'Buffalo', country: 'US', latitude: 42.886, longitude: -78.878, status: 'approved', isVisible: true, description: 'Single empty office unit within an occupied building.' },
]

async function main() {
  const existing = await db.select().from(nodes).limit(1)
  if (existing.length) { console.log('nodes table not empty — skipping seed'); return }
  await db.insert(nodes).values(SAMPLES)
  console.log(`seeded ${SAMPLES.length} approved nodes`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
