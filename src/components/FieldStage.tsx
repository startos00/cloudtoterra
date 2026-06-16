'use client'

import { useEffect, useRef, useState } from 'react'

type Mode = 'A' | 'B' | 'C' | 'D'

const FIGS: { key: Mode; tab: string; title: string; caption: string }[] = [
  { key: 'A', tab: 'Fig. A', title: 'Distribution', caption: 'Dormant assets scatter across the field, holding apart yet implying a structure no boundary has drawn. Proximity, not outline, suggests where the city has gone quiet.' },
  { key: 'B', tab: 'Fig. B', title: 'Civic Fabric', caption: 'The civic grid, the streets, blocks, and institutions, bends around a catalyst. A single reactivation deforms the whole field around it rather than leaving it untouched.' },
  { key: 'C', tab: 'Fig. C', title: 'Terrain', caption: 'The ground itself is surveyed continuously as a scalar field. Elevation and condition are read as undulating contours rather than fixed lines.' },
  { key: 'D', tab: 'Fig. D', title: 'Interference', caption: 'Overlapping claims, ownership, civic use, and access, interfere. Where the layers cross, new patterns of opportunity emerge that no single layer predicts.' },
]

const THUMBS: Record<Mode, React.ReactNode> = {
  A: (<>{[[50, 50, 2], [40, 45, 1.5], [60, 55, 1], [45, 60, 1], [62, 40, 1.5], [35, 52, 1], [70, 48, 1], [50, 35, 1], [30, 38, 1], [68, 66, 1.2], [55, 70, 1]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</>),
  B: (<>{[20, 35, 50, 65, 80].map((x, i) => <line key={`v${i}`} x1={x} y1="18" x2={x} y2="82" />).concat([20, 35, 50, 65, 80].map((y, i) => <line key={`h${i}`} x1="18" y1={y} x2="82" y2={y} />))}</>),
  C: (<>{[28, 44, 60, 76].map((y, i) => <path key={i} d={`M 14 ${y} Q 35 ${y - 10} 50 ${y} T 86 ${y}`} fill="none" />)}</>),
  D: (<>{[[16, 16, 28, 26], [46, 14, 30, 30], [18, 50, 26, 30], [50, 50, 30, 28]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} />)}</>),
}

export function FieldStage() {
  const [active, setActive] = useState<Mode>('A')
  const [density, setDensity] = useState(72)
  const [scale, setScale] = useState(52)
  const [cursor, setCursor] = useState('0.000, 0.000')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const params = useRef({ density: 72, scale: 52, mx: 0, my: 0, hover: false })

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
    const onLeave = () => { params.current.hover = false }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseenter', onEnter)
    canvas.addEventListener('mouseleave', onLeave)

    // persistent swarm particles (draw a density-scaled subset)
    const MAXP = 560
    const ps = Array.from({ length: MAXP }, () => ({ x: Math.random(), y: Math.random(), ox: Math.random(), oy: Math.random(), s: Math.random(), vx: 0, vy: 0 }))
    let t = 0
    let raf = 0

    const draw = () => {
      const { density: d, scale: s, mx, my, hover } = params.current
      const dens = d / 100, sc = 0.5 + (s / 100) * 1.4
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = '#000'; ctx.fillStyle = '#000'; ctx.lineWidth = 1
      t += 0.016

      if (active === 'A') {
        const N = Math.floor(80 + dens * 480)
        for (let i = 0; i < N; i++) {
          const p = ps[i]
          const px = p.x * w, py = p.y * h
          let nx = px, ny = py
          if (hover) { const dx = px - mx, dy = py - my, dist = Math.hypot(dx, dy); if (dist < 90 && dist > 0) { const f = (90 - dist) / 90 * 22; nx += (dx / dist) * f; ny += (dy / dist) * f } }
          ctx.beginPath(); ctx.arc(nx, ny, 0.7 + p.s * 2.2 * sc, 0, Math.PI * 2); ctx.fill()
        }
      } else if (active === 'B') {
        const sp = Math.max(10, 40 - dens * 26)
        const warp = (x: number, y: number) => {
          const dx = mx - x, dy = my - y, dist = Math.hypot(dx, dy)
          let push = 0; if (hover && dist < 140) push = Math.sin((1 - dist / 140) * Math.PI) * 30 * sc
          const a = Math.atan2(dy, dx); return [x - Math.cos(a) * push, y - Math.sin(a) * push] as const
        }
        ctx.beginPath()
        for (let x = 0; x <= w; x += sp) { ctx.moveTo(x, 0); for (let y = 0; y <= h; y += 9) { const [a, b] = warp(x, y); ctx.lineTo(a, b) } }
        for (let y = 0; y <= h; y += sp) { ctx.moveTo(0, y); for (let x = 0; x <= w; x += 9) { const [a, b] = warp(x, y); ctx.lineTo(a, b) } }
        ctx.stroke()
      } else if (active === 'C') {
        const gap = Math.max(8, 22 - dens * 12)
        const amp = 18 * sc
        const noise = (x: number, y: number) => (Math.sin(x * 0.018 + t) + Math.sin(y * 0.026 - t * 0.8) + Math.sin((x + y) * 0.013 + t * 1.1)) / 3
        ctx.beginPath()
        for (let y = 0; y <= h; y += gap) {
          ctx.moveTo(0, y)
          for (let x = 0; x <= w; x += 7) {
            let v = noise(x, y)
            if (hover) { const dist = Math.hypot(x - mx, y - my); if (dist < 110) v += Math.sin((1 - dist / 110) * Math.PI) }
            ctx.lineTo(x, y - v * amp)
          }
        }
        ctx.stroke()
      } else {
        const gap = Math.max(3.5, 8 - dens * 4)
        const rot = ((hover ? (mx / Math.max(1, w)) : 0.5) - 0.5) * 0.22
        const drawLines = (ang: number) => {
          ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(ang); ctx.beginPath()
          const diag = Math.hypot(w, h)
          for (let y = -diag / 2; y < diag / 2; y += gap) { ctx.moveTo(-diag / 2, y); ctx.lineTo(diag / 2, y) }
          ctx.stroke(); ctx.restore()
        }
        drawLines(0); drawLines(rot)
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
      {/* ── left: index + parameters ─────────────────────────────────────── */}
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
                className={`relative grid aspect-square place-items-center p-2 transition-colors ${active === f.key ? 'bg-ink text-paper' : 'text-ink hover:bg-ink hover:text-paper'}`}
              >
                <svg viewBox="0 0 100 100" className="h-full w-full" style={{ stroke: 'currentColor', fill: 'currentColor', strokeWidth: 2 }} fill="none">
                  {THUMBS[f.key]}
                </svg>
                <span className="absolute -bottom-5 left-0 text-[0.65rem] font-semibold">{f.tab}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-3">
          <span className="label mb-4 block">Parameters</span>
          <label className="mb-4 block">
            <span className="flex justify-between text-xs font-semibold"><span>Density</span><span className="coord">{(density / 100).toFixed(2)}</span></span>
            <input className="mt-2" type="range" min={0} max={100} value={density} onChange={(e) => setDensity(+e.target.value)} />
          </label>
          <label className="block">
            <span className="flex justify-between text-xs font-semibold"><span>Scale Factor</span><span className="coord">{(0.5 + (scale / 100) * 1.4).toFixed(1)}×</span></span>
            <input className="mt-2" type="range" min={0} max={100} value={scale} onChange={(e) => setScale(+e.target.value)} />
          </label>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <a href="/map" className="btn-ink">Open the map</a>
          <a href="/map" className="btn-ghost">Add a place</a>
        </div>
      </aside>

      {/* ── right: stage ─────────────────────────────────────────────────── */}
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
