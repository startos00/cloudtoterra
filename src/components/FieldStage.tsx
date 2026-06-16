'use client'

import { useEffect, useRef, useState } from 'react'

type Mode = 'A' | 'B' | 'C' | 'D'

const FIGS: { key: Mode; tab: string; title: string; caption: string }[] = [
  { key: 'A', tab: 'Fig. A', title: 'Footprints', caption: 'Dormant building footprints in plan, a figure-ground of the quiet city. Move across the field to select a structure waiting to be brought back into use.' },
  { key: 'B', tab: 'Fig. B', title: 'Civic Front', caption: 'The civic asset nobody else maps: courthouse, library, hall. Its colonnade and pediment, drawn as elevation, often the finest building in town and left between identities.' },
  { key: 'C', tab: 'Fig. C', title: 'Urban Fabric', caption: 'Blocks and streets as figure-ground. A single catalyst opens the fabric around it; the grid does not break, it accommodates the change.' },
  { key: 'D', tab: 'Fig. D', title: 'Reactivation', caption: 'An elevation of the block. Pass over it and dormant structures rise and light their windows, the city waking one parcel at a time.' },
]

const THUMBS: Record<Mode, React.ReactNode> = {
  // footprints (figure-ground plan)
  A: (<g fill="currentColor" stroke="none">{[[18, 18], [52, 16], [16, 50], [54, 52]].map(([x, y], i) => <rect key={i} x={x} y={y} width="26" height="26" />)}</g>),
  // civic front: pediment + columns + base
  B: (<g stroke="currentColor" strokeWidth="3" fill="none">
    <path d="M 16 42 L 50 18 L 84 42" />
    {[28, 42, 58, 72].map((x, i) => <line key={i} x1={x} y1="46" x2={x} y2="78" />)}
    <line x1="14" y1="84" x2="86" y2="84" />
  </g>),
  // urban fabric: blocks with street gaps
  C: (<g fill="currentColor" stroke="none">{[[14, 14], [54, 14], [14, 54], [54, 54]].map(([x, y], i) => <rect key={i} x={x} y={y} width="32" height="32" />)}</g>),
  // skyline elevation
  D: (<g fill="currentColor" stroke="none">{[[16, 60, 40], [34, 38, 62], [54, 70, 30], [70, 50, 50]].map(([x, y, hh], i) => <rect key={i} x={x} y={y} width="12" height={hh} />)}</g>),
}

export function FieldStage() {
  const [active, setActive] = useState<Mode>('A')
  const [density, setDensity] = useState(58)
  const [scale, setScale] = useState(54)
  const [cursor, setCursor] = useState('0.000, 0.000')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const params = useRef({ density: 58, scale: 54, mx: -999, my: -999, hover: false })

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
      ctx.strokeStyle = '#000'; ctx.fillStyle = '#000'; ctx.lineWidth = 1.4

      if (active === 'A') {
        // figure-ground footprints; cursor selects one
        const cols = 4 + Math.floor(dens * 8)
        const rows = Math.max(3, Math.round((cols * h) / w))
        const cw = w / cols, ch = h / rows
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const seed = i * 73.3 + j * 131.7
            const inset = (0.26 - sc * 0.09) + rnd(seed) * 0.08
            const fx = i * cw + cw * inset, fy = j * ch + ch * inset
            const fw = cw * (1 - 2 * inset), fh = ch * (1 - 2 * inset)
            const sel = hover && mx >= i * cw && mx < (i + 1) * cw && my >= j * ch && my < (j + 1) * ch
            if (sel) ctx.fillRect(fx, fy, fw, fh)
            else ctx.strokeRect(fx, fy, fw, fh)
          }
        }
      } else if (active === 'B') {
        // civic facade: steps, colonnade, entablature, pediment; cursor lights a column
        const ncol = 4 + Math.floor(dens * 8)
        const fw = Math.min(w * 0.82, w * 0.5 * sc * 1.5)
        const fh = h * 0.46
        const x0 = (w - fw) / 2
        const baseY = h * 0.80
        const topY = baseY - fh
        for (let k = 0; k < 3; k++) ctx.strokeRect(x0 - (2 - k) * 12, baseY + k * 7, fw + (2 - k) * 24, 6)
        const gap = fw / ncol
        for (let c = 0; c < ncol; c++) {
          const cx = x0 + gap * (c + 0.5)
          const cwid = Math.min(gap * 0.46, 12)
          const sel = hover && Math.abs(mx - cx) < gap / 2 && my > topY && my < baseY
          if (sel) ctx.fillRect(cx - cwid / 2, topY + fh * 0.18, cwid, fh * 0.82)
          else ctx.strokeRect(cx - cwid / 2, topY + fh * 0.18, cwid, fh * 0.82)
        }
        ctx.strokeRect(x0, topY + fh * 0.08, fw, fh * 0.1)
        ctx.beginPath(); ctx.moveTo(x0 - 6, topY + fh * 0.08); ctx.lineTo(x0 + fw / 2, topY - fh * 0.16); ctx.lineTo(x0 + fw + 6, topY + fh * 0.08); ctx.closePath(); ctx.stroke()
      } else if (active === 'C') {
        // urban fabric: solid blocks with street gaps, opening around the cursor
        const cols = 4 + Math.floor(dens * 6)
        const rows = Math.max(3, Math.round((cols * h) / w))
        const cw = w / cols, ch = h / rows
        const street = 7
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const cx = i * cw + cw / 2, cy = j * ch + ch / 2
            let open = 0
            if (hover) { const dist = Math.hypot(cx - mx, cy - my); if (dist < 130) open = (1 - dist / 130) * Math.min(cw, ch) * 0.5 }
            const bx = i * cw + street / 2 + open / 2, by = j * ch + street / 2 + open / 2
            const bw = cw - street - open, bh = ch - street - open
            if (bw > 2 && bh > 2) ctx.fillRect(bx, by, bw * sc, bh * sc)
          }
        }
      } else {
        // reactivation skyline: structures rise + windows light near the cursor
        const N = 6 + Math.floor(dens * 12)
        const bw = w / N
        for (let i = 0; i < N; i++) {
          const seed = i * 51.7
          let bh = h * (0.16 + rnd(seed) * 0.32) * sc
          const cx = i * bw + bw / 2
          let lit = 0
          if (hover) { const dist = Math.abs(cx - mx); if (dist < 150) { lit = 1 - dist / 150; bh += lit * h * 0.24 } }
          bh = Math.min(bh, h * 0.92)
          const bx = i * bw + bw * 0.14, by = h - bh, bwid = bw * 0.72
          ctx.strokeRect(bx, by, bwid, bh)
          for (let wy = by + 8; wy < h - 6; wy += 13) {
            for (let wx = bx + 5; wx < bx + bwid - 4; wx += 9) {
              if (lit > 0.15 && rnd(wx * 3.1 + wy * 7.7) < lit) ctx.fillRect(wx, wy, 3.5, 5)
              else { ctx.strokeRect(wx, wy, 3.5, 5) }
            }
          }
        }
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
