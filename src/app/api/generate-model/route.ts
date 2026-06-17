import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getNode, saveModelDraft } from '@/lib/nodes'
import { generateModelSpec } from '@/lib/claude-model'
import { isAdminRequest } from '@/lib/admin-guard'
import type { NodeType } from '@/lib/taxonomy'

const bodySchema = z.object({ id: z.string().uuid() })

// Admin-only: generate a parametric 3D massing for a node (Claude when configured,
// else deterministic) and save it as a DRAFT for review. Does not publish.
export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ data: null, error: 'unauthorised' }, { status: 401 })
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: 'invalid' }, { status: 400 })
  }
  const node = await getNode(db, parsed.data.id)
  if (!node) {
    return NextResponse.json({ data: null, error: 'not_found' }, { status: 404 })
  }
  try {
    const { spec, engine } = await generateModelSpec({
      type: node.type as NodeType,
      subType: node.subType,
      condition: node.condition,
      nodeName: node.nodeName,
      description: node.description,
      boundary: node.boundary,
    })
    await saveModelDraft(db, node.id, spec)
    return NextResponse.json({ data: { spec, engine }, error: null }, { status: 201 })
  } catch {
    return NextResponse.json({ data: null, error: 'generation_failed' }, { status: 500 })
  }
}
