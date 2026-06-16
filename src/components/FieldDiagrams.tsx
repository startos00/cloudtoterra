'use client'

import { useEffect, useRef } from 'react'

const FIGURES = [
  { id: 'swarm', label: 'A. Distribution', desc: 'Scattered dormant assets; mutual repulsion.', overlay: 'N=400' },
  { id: 'grid', label: 'B. Activation', desc: 'The field deforms around a catalyst.', overlay: 'Δ=0.00' },
  { id: 'moire', label: 'C. Interference', desc: 'Overlapping claims and civic layers.', overlay: 'θ=0.0rad' },
  { id: 'topo', label: 'D. Terrain', desc: 'Continuous ground survey.', overlay: 'Z=ƒ(x,y,t)' },
] as const

export function FieldDiagrams() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const rafs: number[] = []
    const setText = (id: string, v: string) => { const e = document.getElementById(id); if (e) e.textContent = v }
    const setActive = (v: string) => setText('active-node', v)

    let cycle = 0
    const cyc = window.setInterval(() => { cycle++; setText('cycle-count', String(cycle)) }, 100)
    const onMove = (e: MouseEvent) =>
      setText('cursor-pos', `${(e.clientX / window.innerWidth).toFixed(3)}, ${(e.clientY / window.innerHeight).toFixed(3)}`)
    document.addEventListener('mousemove', onMove)

    function setup(canvas: HTMLCanvasElement) {
      const ctx = canvas.getContext('2d')!
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement!.getBoundingClientRect()
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      return { ctx, width: rect.width, height: rect.height }
    }
    const find = (id: string) => root.querySelector<HTMLCanvasElement>(`canvas[data-fig="${id}"]`)!

    // A · stochastic swarm with cursor repulsion
    {
      const c = find('swarm')
      const { ctx, width, height } = setup(c)
      let mx = width / 2, my = height / 2, hover = false
      const ps = Array.from({ length: 400 }, () => ({ x: Math.random() * width, y: Math.random() * height, ox: Math.random() * width, oy: Math.random() * height, s: Math.random() * 2 + 1, vx: 0, vy: 0 }))
      c.parentElement!.addEventListener('mousemove', (e) => { const r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top })
      c.parentElement!.addEventListener('mouseenter', () => { hover = true; setActive('FIG.A_SWARM') })
      c.parentElement!.addEventListener('mouseleave', () => { hover = false; setActive('NULL') })
      const loop = () => {
        ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#000'
        for (const p of ps) {
          p.vx += (p.ox - p.x) * 0.01; p.vy += (p.oy - p.y) * 0.01
          if (hover) { const dx = mx - p.x, dy = my - p.y, d = Math.hypot(dx, dy); if (d < 80 && d > 0) { const f = (80 - d) / 80; p.vx -= (dx / d) * f * 2; p.vy -= (dy / d) * f * 2 } }
          p.vx *= 0.85; p.vy *= 0.85; p.x += p.vx; p.y += p.vy
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill()
        }
        rafs.push(requestAnimationFrame(loop))
      }
      loop()
    }

    // B · grid deformation under cursor
    {
      const c = find('grid')
      const { ctx, width, height } = setup(c)
      let mx = width / 2, my = height / 2, tx = mx, ty = my, hover = false
      const sp = 20
      c.parentElement!.addEventListener('mousemove', (e) => { const r = c.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top })
      c.parentElement!.addEventListener('mouseenter', () => { hover = true; setActive('FIG.B_DEFORM') })
      c.parentElement!.addEventListener('mouseleave', () => { hover = false; setActive('NULL') })
      const loop = () => {
        ctx.clearRect(0, 0, width, height); ctx.strokeStyle = '#000'; ctx.lineWidth = 1
        mx += (tx - mx) * 0.1; my += (ty - my) * 0.1
        let maxd = 0
        const warp = (x: number, y: number) => {
          const dx = mx - x, dy = my - y, d = Math.hypot(dx, dy)
          let push = 0
          if (hover && d < 120) { push = Math.sin((1 - d / 120) * Math.PI) * 30; if (push > maxd) maxd = push }
          const a = Math.atan2(dy, dx)
          return [x - Math.cos(a) * push, y - Math.sin(a) * push] as const
        }
        ctx.beginPath()
        for (let x = 0; x <= width; x += sp) { ctx.moveTo(x, 0); for (let y = 0; y <= height; y += 10) { const [px, py] = warp(x, y); ctx.lineTo(px, py) } }
        for (let y = 0; y <= height; y += sp) { ctx.moveTo(0, y); for (let x = 0; x <= width; x += 10) { const [px, py] = warp(x, y); ctx.lineTo(px, py) } }
        ctx.stroke()
        setText('ov-grid', `Δ=${(maxd / 30).toFixed(2)}`)
        rafs.push(requestAnimationFrame(loop))
      }
      loop()
    }

    // C · moiré interference
    {
      const c = find('moire')
      const { ctx, width, height } = setup(c)
      let rot = 0, target = 0
      c.parentElement!.addEventListener('mousemove', (e) => { const r = c.getBoundingClientRect(); target = ((e.clientX - r.left) / width - 0.5) * 0.2 })
      c.parentElement!.addEventListener('mouseenter', () => setActive('FIG.C_INTERFERE'))
      c.parentElement!.addEventListener('mouseleave', () => { target = 0; setActive('NULL') })
      const lines = (a: number) => {
        ctx.save(); ctx.translate(width / 2, height / 2); ctx.rotate(a); ctx.beginPath()
        const diag = Math.hypot(width, height)
        for (let y = -diag / 2; y < diag / 2; y += 4) { ctx.moveTo(-diag / 2, y); ctx.lineTo(diag / 2, y) }
        ctx.stroke(); ctx.restore()
      }
      const loop = () => {
        ctx.clearRect(0, 0, width, height); ctx.strokeStyle = '#000'; ctx.lineWidth = 1
        rot += (target - rot) * 0.05; lines(0); lines(rot)
        setText('ov-moire', `θ=${rot.toFixed(3)}rad`)
        rafs.push(requestAnimationFrame(loop))
      }
      loop()
    }

    // D · topographic contour noise
    {
      const c = find('topo')
      const { ctx, width, height } = setup(c)
      let t = 0, infl = 0, target = 0, mx = 0, my = 0
      c.parentElement!.addEventListener('mousemove', (e) => { const r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top })
      c.parentElement!.addEventListener('mouseenter', () => { target = 1; setActive('FIG.D_TOPO') })
      c.parentElement!.addEventListener('mouseleave', () => { target = 0; setActive('NULL') })
      const noise = (x: number, y: number, tt: number) => (Math.sin(x * 0.02 + tt) + Math.sin(y * 0.03 - tt * 0.8) + Math.sin((x + y) * 0.015 + tt * 1.2)) / 3
      const loop = () => {
        ctx.clearRect(0, 0, width, height); ctx.strokeStyle = '#000'; ctx.lineWidth = 1
        t += 0.02; infl += (target - infl) * 0.05
        ctx.beginPath()
        for (let y = 0; y <= height; y += 12) {
          ctx.moveTo(0, y)
          for (let x = 0; x <= width; x += 8) {
            let v = noise(x, y, t)
            if (infl > 0) { const d = Math.hypot(x - mx, y - my); if (d < 100) v += Math.sin((1 - d / 100) * Math.PI) * infl }
            ctx.lineTo(x, y - Math.floor(v * 8) * 4)
          }
        }
        ctx.stroke()
        rafs.push(requestAnimationFrame(loop))
      }
      loop()
    }

    return () => {
      rafs.forEach(cancelAnimationFrame)
      window.clearInterval(cyc)
      document.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <section
      ref={rootRef}
      className="grid-bg grid grid-cols-1 gap-x-10 gap-y-12 border-ink p-8 sm:grid-cols-2 lg:border-l"
    >
      {FIGURES.map((f) => (
        <figure key={f.id} className="flex flex-col gap-3">
          <div className="relative aspect-square border border-ink bg-paper">
            <canvas data-fig={f.id} className="block h-full w-full" style={{ imageRendering: 'pixelated' }} />
            <span className="meta absolute right-2 top-2" id={`ov-${f.id}`}>{f.overlay}</span>
          </div>
          <figcaption className="flex items-start justify-between gap-3">
            <span className="font-sans text-xs font-semibold uppercase">{f.label}</span>
            <span className="meta max-w-[60%] text-right" style={{ textTransform: 'none' }}>{f.desc}</span>
          </figcaption>
        </figure>
      ))}
    </section>
  )
}
