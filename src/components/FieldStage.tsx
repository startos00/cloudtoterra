'use client'

import { useEffect, useRef, useState } from 'react'

type Mode = 'A' | 'B' | 'C' | 'D'

const FIGS: { key: Mode; tab: string; title: string; caption: string }[] = [
  { key: 'A', tab: 'Fig. A', title: 'Parcellation', caption: 'Territory divides and re-divides. Move across the field and the grain refines around you, the way attention subdivides a place the moment it is seen.' },
  { key: 'B', tab: 'Fig. B', title: 'Flow', caption: 'Civic-pattern flows across the ground, migration, capital, footfall. The streams bend into a vortex around a catalyst, the way a place turns once it is reactivated.' },
  { key: 'C', tab: 'Fig. C', title: 'Adjacency', caption: 'Assets and institutions as a network of nearest relations. Pull a node and the web of adjacencies flexes; in a field condition, nothing stands alone.' },
  { key: 'D', tab: 'Fig. D', title: 'Aggregation', caption: 'Opportunity packs into the gaps, each disk a territory sized by its room to grow. The one beneath your cursor is the one being claimed.' },
]

const THUMBS: Record<Mode, React.ReactNode> = {
  A: (<g stroke="currentColor" fill="none" strokeWidth="3"><rect x="12" y="12" width="76" height="76" /><line x1="50" y1="12" x2="50" y2="88" /><line x1="50" y1="50" x2="88" y2="50" /><line x1="12" y1="68" x2="50" y2="68" /><line x1="31" y1="50" x2="31" y2="88" /></g>),
  B: (<g stroke="currentColor" fill="none" strokeWidth="3"><path d="M10 28 Q 50 6 90 34" /><path d="M10 52 Q 50 74 90 50" /><path d="M10 76 Q 50 58 90 80" /></g>),
  C: (<g stroke="currentColor" strokeWidth="2.5"><line x1="24" y1="30" x2="60" y2="22" /><line x1="60" y1="22" x2="78" y2="56" /><line x1="78" y1="56" x2="40" y2="74" /><line x1="40" y1="74" x2="24" y2="30" /><line x1="24" y1="30" x2="78" y2="56" />{[[24, 30], [60, 22], [78, 56], [40, 74]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="currentColor" stroke="none" />)}</g>),
  D: (<g stroke="currentColor" fill="none" strokeWidth="3"><circle cx="36" cy="40" r="24" /><circle cx="70" cy="62" r="16" /><circle cx="68" cy="26" r="11" /><circle cx="28" cy="74" r="10" /></g>),
}

export function FieldStage() {
  const [active, setActive] = useState<Mode>('A')
  const [density, setDensity] = useState(52)
  const [scale, setScale] = useState(56)
  const [cursor, setCursor] = useState('0.000, 0.000')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const params = useRef({ density: 52, scale: 56, mx: -999, my: -999, hover: false })

  useEffect(() => { params.current.density = density; params.current.scale = scale }, [density, scale])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    let w = 0, h = 0
    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect()
      w = r.width; h = r.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    const onMove = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); params.current.mx = e.clientX - r.left; params.current.my = e.clientY - r.top }
    const onEnter = () => { params.current.hover = true }
    const onLeave = () => { params.current.hover = false; params.current.mx = -999; params.current.my = -999 }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseenter', onEnter)
    canvas.addEventListener('mouseleave', onLeave)

    const rnd = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x) }
    let raf = 0

    const draw = () => {
      const { density: d, scale: s, mx, my, hover } = params.current
      const dens = d / 100, sc = 0.7 + (s / 100) * 0.8
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = '#000'; ctx.fillStyle = '#000'; ctx.lineWidth = 1

      if (active === 'A') {
        const minLeaf = 16 + (1 - dens) * 44
        const subdivide = (x: number, y: number, wd: number, ht: number, depth: number) => {
          const cx = x + wd / 2, cy = y + ht / 2
          let target = 2 + Math.floor(dens * 3)
          if (hover) { const dist = Math.hypot(cx - mx, cy - my); if (dist < 220) target += Math.round((1 - dist / 220) * 4) }
          if (depth >= target || wd < minLeaf * 1.5 || ht < minLeaf * 1.5) { ctx.strokeRect(x + 2, y + 2, wd - 4, ht - 4); return }
          const seed = Math.floor(x * 0.7) + Math.floor(y * 0.5) * 7 + depth * 131
          const r = 0.34 + rnd(seed) * 0.32
          if (wd >= ht) { const sp = wd * r; subdivide(x, y, sp, ht, depth + 1); subdivide(x + sp, y, wd - sp, ht, depth + 1) }
          else { const sp = ht * r; subdivide(x, y, wd, sp, depth + 1); subdivide(x, y + sp, wd, ht - sp, depth + 1) }
        }
        subdivide(0, 0, w, h, 0)
      } else if (active === 'B') {
        const field = (x: number, y: number) => {
          let a = (Math.sin(x * 0.006 + y * 0.004) + Math.cos(y * 0.0075 - x * 0.0035)) * Math.PI
          if (hover) { const dx = x - mx, dy = y - my, dist = Math.hypot(dx, dy); if (dist < 190) { const wgt = 1 - dist / 190; a = a * (1 - wgt) + (Math.atan2(dy, dx) + Math.PI * 0.5) * wgt } }
          return a
        }
        const step = Math.max(14, 30 - dens * 14)
        const len = Math.floor(16 + dens * 30)
        for (let sy = step * 0.6; sy < h; sy += step) {
          for (let sx = step * 0.6; sx < w; sx += step) {
            let px = sx, py = sy
            ctx.beginPath(); ctx.moveTo(px, py)
            for (let i = 0; i < len; i++) { const a = field(px, py); px += Math.cos(a) * 4 * sc; py += Math.sin(a) * 4 * sc; if (px < -2 || px > w + 2 || py < -2 || py > h + 2) break; ctx.lineTo(px, py) }
            ctx.stroke()
          }
        }
      } else if (active === 'C') {
        const cols = Math.round(4 + dens * 5)
        const rows = Math.max(3, Math.round((cols * h) / w))
        const cw = w / cols, ch = h / rows
        const pts: { x: number; y: number }[] = []
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const seed = i * 31.1 + j * 57.7
            let bx = (i + 0.5) * cw + (rnd(seed) - 0.5) * cw * 0.6
            let by = (j + 0.5) * ch + (rnd(seed + 9) - 0.5) * ch * 0.6
            if (hover) { const dx = mx - bx, dy = my - by, dist = Math.hypot(dx, dy); if (dist < 170 && dist > 0) { const f = (1 - dist / 170) * 46; bx += (dx / dist) * f; by += (dy / dist) * f } }
            pts.push({ x: bx, y: by })
          }
        }
        const R = Math.max(cw, ch) * 1.5
        for (let a = 0; a < pts.length; a++) {
          for (let b = a + 1; b < pts.length; b++) {
            const dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y, dist = Math.hypot(dx, dy)
            if (dist < R) { ctx.globalAlpha = Math.max(0.12, 1 - dist / R); ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); ctx.stroke() }
          }
        }
        ctx.globalAlpha = 1
        for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, 2.2 * sc, 0, Math.PI * 2); ctx.fill() }
      } else {
        const minR = 6 + (1 - dens) * 14
        const maxR = Math.min(w, h) * 0.16 * sc
        const circles: { x: number; y: number; r: number }[] = []
        for (let k = 0; k < 260; k++) {
          const x = rnd(k * 1.7 + 0.3) * w, y = rnd(k * 2.9 + 3.1) * h
          let r = maxR
          for (const c of circles) { const dd = Math.hypot(x - c.x, y - c.y) - c.r; if (dd < r) r = dd }
          r = Math.min(r, x - 2, w - x - 2, y - 2, h - y - 2)
          if (r >= minR) circles.push({ x, y, r: Math.min(r, maxR) })
        }
        let sel = -1, best = 1e9
        if (hover) for (let i = 0; i < circles.length; i++) { const dd = Math.hypot(circles[i].x - mx, circles[i].y - my); if (dd < circles[i].r && dd < best) { best = dd; sel = i } }
        circles.forEach((c, i) => { ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); if (i === sel) ctx.fill(); else ctx.stroke() })
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseenter', onEnter)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [active])

  useEffect(() => {
    const onMove = (e: MouseEvent) => setCursor(`${(e.clientX / window.innerWidth).toFixed(3)}, ${(e.clientY / window.innerHeight).toFixed(3)}`)
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const fig = FIGS.find((f) => f.key === active)!

  return (
    <div className="aurora grid min-h-[calc(100dvh-3rem)] grid-cols-1 lg:grid-cols-[330px_1fr]">
      <aside className="flex flex-col gap-8 p-8">
        <header className="flex items-start gap-4">
          <div className="text-3xl font-bold leading-none tracking-tight">01</div>
          <h1 className="max-w-[15rem] text-xs font-bold uppercase leading-snug tracking-[0.1em]">
            Field Atlas of Dormant Ground<br />Interactive Index
          </h1>
        </header>

        <nav>
          <span className="label mb-3 block">Index / Figures A–D</span>
          <div className="grid grid-cols-2 gap-4">
            {FIGS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className={`relative grid aspect-square place-items-center p-3 transition-colors ${active === f.key ? 'bg-ink text-paper' : 'text-ink hover:bg-ink hover:text-paper'}`}
              >
                <svg viewBox="0 0 100 100" className="h-full w-full">{THUMBS[f.key]}</svg>
                <span className="absolute -bottom-5 left-0 text-[0.65rem] font-semibold">{f.tab}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-3">
          <span className="label mb-4 block">Parameters</span>
          <label className="mb-4 block">
            <span className="flex justify-between text-xs font-semibold"><span>Grain</span><span className="coord">{(density / 100).toFixed(2)}</span></span>
            <input className="mt-2" type="range" min={0} max={100} value={density} onChange={(e) => setDensity(+e.target.value)} />
          </label>
          <label className="block">
            <span className="flex justify-between text-xs font-semibold"><span>Scale Factor</span><span className="coord">{(0.7 + (scale / 100) * 0.8).toFixed(2)}×</span></span>
            <input className="mt-2" type="range" min={0} max={100} value={scale} onChange={(e) => setScale(+e.target.value)} />
          </label>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <a href="/map" className="btn-ink">Open the map</a>
          <a href="/map" className="btn-ghost">Add a place</a>
        </div>
      </aside>

      <main className="flex flex-col">
        <header className="flex items-center justify-between px-8 py-4 text-xs font-semibold">
          <span>Viewing: {fig.tab} — {fig.title}</span>
          <span className="meta coord">Cursor {cursor}</span>
        </header>

        <div className="relative flex flex-1 items-center justify-center p-6 lg:p-12">
          <div className="aspect-square w-full max-w-[600px]">
            <canvas ref={canvasRef} className="block h-full w-full cursor-crosshair" />
          </div>
        </div>

        <footer className="px-8 pb-8 lg:columns-2 lg:gap-12">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.05em]">{fig.title} · Field Condition</span>
          <p className="text-justify text-sm leading-relaxed text-ink-2">{fig.caption}</p>
        </footer>
      </main>
    </div>
  )
}
