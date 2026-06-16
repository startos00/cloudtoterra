import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { listVisible } from '@/lib/nodes'
import { densityFeatureCollection } from '@/lib/overlays'

// Self-derived distress-density overlay (GeoJSON heatmap source) from approved nodes.
export async function GET() {
  try {
    const nodes = await listVisible(db, {})
    return NextResponse.json({ data: densityFeatureCollection(nodes), error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'failed_to_build_overlay' }, { status: 500 })
  }
}
