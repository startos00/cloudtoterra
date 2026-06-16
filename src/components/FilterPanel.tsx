'use client'

import { NODE_TYPES, CONDITIONS, type NodeType } from '@/lib/taxonomy'
import { TYPE_LABELS } from '@/lib/ui'

export type Filters = { types: NodeType[]; condition: string | '' }

export function FilterPanel({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  function toggleType(t: NodeType) {
    const has = filters.types.includes(t)
    onChange({ ...filters, types: has ? filters.types.filter((x) => x !== t) : [...filters.types, t] })
  }
  return (
    <div className="rounded border border-line bg-paper/95 p-3 shadow-sm backdrop-blur">
      <div className="label">Filter</div>
      <div className="mt-2 flex flex-col gap-1.5">
        {NODE_TYPES.map((t) => (
          <label key={t} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="accent-[var(--color-ember)]"
              checked={filters.types.includes(t)}
              onChange={() => toggleType(t)}
            />
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: `var(--color-${t})` }} />
            {TYPE_LABELS[t]}
          </label>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="label">Condition</span>
        <select
          className="mt-1 w-full rounded border border-line bg-paper p-1.5 text-sm text-ink"
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
