'use client'

import { NODE_TYPES, CONDITIONS, type NodeType } from '@/lib/taxonomy'
import { TYPE_COLORS, TYPE_LABELS } from '@/lib/ui'

export type Filters = { types: NodeType[]; condition: string | '' }

export function FilterPanel({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  function toggleType(t: NodeType) {
    const has = filters.types.includes(t)
    onChange({ ...filters, types: has ? filters.types.filter((x) => x !== t) : [...filters.types, t] })
  }
  return (
    <div className="rounded-lg bg-white/95 p-3 shadow-md backdrop-blur">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Show</div>
      <div className="mt-2 flex flex-col gap-1">
        {NODE_TYPES.map((t) => (
          <label key={t} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.types.length === 0 || filters.types.includes(t)}
              onChange={() => toggleType(t)}
            />
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: TYPE_COLORS[t] }} />
            {TYPE_LABELS[t]}
          </label>
        ))}
      </div>
      <label className="mt-3 block text-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Condition</span>
        <select
          className="mt-1 w-full rounded border p-1.5 text-sm"
          value={filters.condition}
          onChange={(e) => onChange({ ...filters, condition: e.target.value })}
        >
          <option value="">any</option>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
    </div>
  )
}
