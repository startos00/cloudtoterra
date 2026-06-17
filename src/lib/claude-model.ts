import Anthropic from '@anthropic-ai/sdk'
import { BuildingSpecSchema, specFromNode, type BuildingSpec, type GenInput } from './model-spec'

const MODEL = 'claude-sonnet-4-6'

const TOOL: Anthropic.Tool = {
  name: 'emit_building',
  description: 'Emit a parametric massing of the property for a 3D viewer.',
  input_schema: {
    type: 'object',
    required: ['summary', 'elements'],
    properties: {
      summary: { type: 'string', description: 'one line describing the massing' },
      storeys: { type: 'integer' },
      elements: {
        type: 'array',
        description: '1-18 volumes; metres; base-centre [x,baseY,z]',
        items: {
          type: 'object',
          required: ['kind', 'pos'],
          properties: {
            kind: { type: 'string', enum: ['box', 'gable', 'cylinder'] },
            pos: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3 },
            size: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'box/gable [w,h,d]' },
            radius: { type: 'number' },
            height: { type: 'number' },
            color: { type: 'string', description: '#rrggbb' },
          },
        },
      },
      groundColor: { type: 'string' },
    },
  },
}

function prompt(n: GenInput): string {
  return `Produce a simple parametric massing of this property for a 3D viewer.

Type: ${n.type}
Sub-type: ${n.subType}
Condition: ${n.condition ?? 'n/a'}
Name: ${n.nodeName}
Description: ${n.description ?? '(none)'}

Rules: metres; ground at y=0; each element pos is its base-centre [x, baseY, z]; box/gable use size [w,h,d];
cylinder uses radius+height. Be faithful to described features (storeys, roof shape, towers/chimneys, wings).
Use a dark mass colour like #1b1b1b. Keep it to a clean massing (≤18 elements), not fine detail.`
}

// Generate a building spec from a node. Uses Claude when ANTHROPIC_API_KEY is set,
// otherwise the deterministic generator (so it works offline / in local dev).
export async function generateModelSpec(n: GenInput): Promise<{ spec: BuildingSpec; engine: 'llm' | 'deterministic' }> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return { spec: specFromNode(n), engine: 'deterministic' }
  try {
    const client = new Anthropic({ apiKey: key })
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1600,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'emit_building' },
      system: 'You are an architect producing a faithful but simple parametric massing. Respond only via the emit_building tool.',
      messages: [{ role: 'user', content: prompt(n) }],
    })
    const tu = res.content.find((c) => c.type === 'tool_use')
    const parsed = BuildingSpecSchema.safeParse((tu as { input?: unknown } | undefined)?.input)
    if (!parsed.success) throw new Error('invalid spec from model')
    return { spec: parsed.data, engine: 'llm' }
  } catch {
    return { spec: specFromNode(n), engine: 'deterministic' }
  }
}
