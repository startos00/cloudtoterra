'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { NodeType } from '@/lib/taxonomy'
import type { BuildingSpec, Element } from '@/lib/model-spec'

type Ring = [number, number][]

// Normalize a GeoJSON polygon ring to a centered, unit-ish XZ footprint shape.
function footprintShape(ring: Ring): { shape: THREE.Shape; span: number } | null {
  if (!ring || ring.length < 3) return null
  const xs = ring.map((p) => p[0])
  const ys = ring.map((p) => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const w = maxX - minX || 1e-6
  const h = maxY - minY || 1e-6
  const span = Math.max(w, h)
  const scale = 6 / span
  // latitude compression so the footprint isn't stretched
  const latRad = ((minY + maxY) / 2) * (Math.PI / 180)
  const kx = Math.cos(latRad) || 1
  const shape = new THREE.Shape()
  ring.forEach(([x, y], i) => {
    const px = (x - (minX + maxX) / 2) * scale * kx
    const pz = (y - (minY + maxY) / 2) * scale
    if (i === 0) shape.moveTo(px, pz)
    else shape.lineTo(px, pz)
  })
  shape.closePath()
  return { shape, span }
}

function buildMassing(kind: NodeType, boundary: unknown): THREE.Object3D {
  const group = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.55, metalness: 0.05 })
  const ring = (boundary as { coordinates?: Ring[] } | null)?.coordinates?.[0]
  const fp = ring ? footprintShape(ring) : null

  if (kind === 'land') {
    // thin parcel slab from the drawn footprint (or a square)
    if (fp) {
      const geo = new THREE.ExtrudeGeometry(fp.shape, { depth: 0.25, bevelEnabled: false })
      geo.rotateX(-Math.PI / 2)
      const slab = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x2c52ff, roughness: 0.6, transparent: true, opacity: 0.25 }))
      slab.receiveShadow = true
      group.add(slab)
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x111111 }))
      group.add(edges)
    } else {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 6), mat)
      slab.receiveShadow = true
      group.add(slab)
    }
    return group
  }

  // building / civic / society → an extruded mass with height
  const height = kind === 'civic' ? 3 : kind === 'society' ? 2 : 5
  if (fp) {
    const geo = new THREE.ExtrudeGeometry(fp.shape, { depth: height, bevelEnabled: false })
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, height, 0)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 })))
  } else if (kind === 'society') {
    // a small cluster of blocks (a "village")
    const spots = [[-1.6, -1], [1.4, -1.4], [0.2, 1.2], [-1.2, 1.4], [1.8, 0.8]]
    spots.forEach(([x, z], i) => {
      const hh = 1 + (i % 3)
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, hh, 1.4), mat)
      b.position.set(x, hh / 2, z); b.castShadow = true; b.receiveShadow = true
      group.add(b)
    })
  } else {
    const w = 4, d = 3
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, height, d), mat)
    mesh.position.y = height / 2; mesh.castShadow = true; mesh.receiveShadow = true
    group.add(mesh)
    if (kind === 'civic') {
      const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.62, 1.6, 4), mat)
      roof.position.y = height + 0.8; roof.rotation.y = Math.PI / 4; roof.castShadow = true
      group.add(roof)
    }
  }
  return group
}

function pointInPolygon(x: number, z: number, ring: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j]
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

// Parcel topography: a heightfield grid clipped to the footprint polygon + draped outline.
function buildTerrain(group: THREE.Group, el: Element) {
  const points = el.points, cols = el.cols, rows = el.rows, ring = el.ring
  if (!points || !cols || !rows) return
  const pos: number[] = []
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const a = points[r * cols + c], b = points[r * cols + c + 1]
      const d = points[(r + 1) * cols + c], e = points[(r + 1) * cols + c + 1]
      if (ring && !pointInPolygon((a[0] + e[0]) / 2, (a[2] + e[2]) / 2, ring)) continue
      pos.push(a[0], a[1], a[2], d[0], d[1], d[2], e[0], e[1], e[2])
      pos.push(a[0], a[1], a[2], e[0], e[1], e[2], b[0], b[1], b[2])
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.computeVertexNormals()
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: new THREE.Color(el.color ?? '#7d7f73'), roughness: 0.95, metalness: 0, side: THREE.DoubleSide }))
  mesh.castShadow = true; mesh.receiveShadow = true
  group.add(mesh)
  if (ring && ring.length > 1) {
    const linePts = ring.map(([x, z]) => new THREE.Vector3(x, 0.03, z))
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePts), new THREE.LineBasicMaterial({ color: 0x111111 })))
  }
}

// Build geometry from a validated parametric spec (the AI/auto-generated massing).
function buildFromSpec(spec: BuildingSpec): THREE.Object3D {
  const group = new THREE.Group()
  for (const el of spec.elements) {
    if (el.kind === 'terrain') { buildTerrain(group, el); continue }
    if (!el.pos) continue
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(el.color ?? '#1b1b1b'), roughness: 0.55, metalness: 0.05 })
    const [x, baseY, z] = el.pos
    if (el.kind === 'box' && el.size) {
      const [w, hh, d] = el.size
      const geo = new THREE.BoxGeometry(w, hh, d)
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x, baseY + hh / 2, z); mesh.castShadow = true; mesh.receiveShadow = true
      group.add(mesh)
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }))
      edges.position.copy(mesh.position)
      group.add(edges)
    } else if (el.kind === 'gable' && el.size) {
      const [w, hh, d] = el.size
      const shape = new THREE.Shape(); shape.moveTo(-w / 2, 0); shape.lineTo(w / 2, 0); shape.lineTo(0, hh); shape.closePath()
      const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false }); geo.translate(0, 0, -d / 2)
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x, baseY, z); mesh.castShadow = true; mesh.receiveShadow = true
      group.add(mesh)
    } else if (el.kind === 'cylinder' && el.radius && el.height) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(el.radius, el.radius, el.height, 28), mat)
      mesh.position.set(x, baseY + el.height / 2, z); mesh.castShadow = true; mesh.receiveShadow = true
      group.add(mesh)
    }
  }
  return group
}

export function ModelViewer({ modelUrl, kind, boundary, spec }: { modelUrl?: string | null; kind: NodeType; boundary?: unknown; spec?: BuildingSpec | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'model' | 'massing' | 'generated' | 'error'>('loading')

  useEffect(() => {
    const mount = ref.current
    if (!mount) return
    const w = mount.clientWidth, h = mount.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf4f4f2)
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.set(9, 7, 11)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfcabd, 0.9))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(8, 14, 6); key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 1; key.shadow.camera.far = 60
    const s = 14; Object.assign(key.shadow.camera, { left: -s, right: s, top: s, bottom: -s })
    scene.add(key)

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(40, 64),
      new THREE.ShadowMaterial({ opacity: 0.12 }),
    )
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.001; ground.receiveShadow = true
    scene.add(ground)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true; controls.dampingFactor = 0.08
    controls.autoRotate = true; controls.autoRotateSpeed = 0.8
    controls.target.set(0, 1.5, 0)
    controls.minDistance = 5; controls.maxDistance = 40
    controls.maxPolarAngle = Math.PI / 2.05

    let disposed = false
    function frame(obj: THREE.Object3D) {
      const box = new THREE.Box3().setFromObject(obj)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const radius = Math.max(size.x, size.y, size.z) || 4
      obj.position.sub(center).setY(obj.position.y - box.min.y) // sit on ground
      controls.target.set(0, size.y / 2, 0)
      const dist = radius * 2.1
      camera.position.set(dist, dist * 0.8, dist * 1.15)
      controls.update()
    }

    if (modelUrl) {
      new GLTFLoader().load(
        modelUrl,
        (gltf) => {
          if (disposed) return
          gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true } })
          scene.add(gltf.scene); frame(gltf.scene); setStatus('model')
        },
        undefined,
        () => { if (!disposed) { const m = buildMassing(kind, boundary); scene.add(m); frame(m); setStatus('error') } },
      )
    } else if (spec) {
      const m = buildFromSpec(spec); scene.add(m); frame(m)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('generated')
    } else {
      const m = buildMassing(kind, boundary); scene.add(m); frame(m); setStatus('massing')
    }

    let raf = 0
    const loop = () => { controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop) }
    loop()

    const ro = new ResizeObserver(() => {
      const nw = mount.clientWidth, nh = mount.clientHeight
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh)
    })
    ro.observe(mount)

    return () => {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect(); controls.dispose()
      renderer.dispose(); mount.removeChild(renderer.domElement)
    }
  }, [modelUrl, kind, boundary, spec])

  return (
    <div className="relative h-full w-full">
      <div ref={ref} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-3 left-3 text-[8px] uppercase tracking-[0.1em] text-ink-3">
        {status === 'model' ? 'Render: uploaded model · drag to orbit'
          : status === 'generated' ? 'Render: generated massing · drag to orbit'
          : status === 'massing' ? 'Render: procedural massing · drag to orbit'
          : status === 'error' ? 'Model failed · showing massing'
          : 'Loading…'}
      </div>
    </div>
  )
}
