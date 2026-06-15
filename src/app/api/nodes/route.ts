import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { submissionSchema } from '@/lib/validation'
import { createNode, listVisible } from '@/lib/nodes'
import { clientIp, ipHash, isHoneypotTripped, recentCountForIp, RATE_LIMIT } from '@/lib/abuse'

export async function GET(req: Request) {
  try {
    const u = new URL(req.url)
    const filters = {
      type: u.searchParams.get('type') ?? undefined,
      subType: u.searchParams.get('subType') ?? undefined,
      condition: u.searchParams.get('condition') ?? undefined,
    }
    const data = await listVisible(db, filters)
    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'failed_to_list' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ data: null, error: 'invalid_json' }, { status: 400 })
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ data: null, error: 'rejected' }, { status: 400 })
    }
    const parsed = submissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues[0]?.message ?? 'invalid' },
        { status: 400 },
      )
    }
    const hash = ipHash(clientIp(req))
    if ((await recentCountForIp(db, hash, RATE_LIMIT.windowMinutes)) >= RATE_LIMIT.max) {
      return NextResponse.json({ data: null, error: 'rate_limited' }, { status: 429 })
    }
    const { website: _hp, ...fields } = parsed.data
    void _hp
    const row = await createNode(db, { ...fields, ipHash: hash })
    return NextResponse.json({ data: row, error: null }, { status: 201 })
  } catch {
    return NextResponse.json({ data: null, error: 'failed_to_create' }, { status: 500 })
  }
}
