// Browser-only image helpers. Downscale an uploaded image once, then encode it
// either as a base64 JPEG data URL (local fallback, stored inline) or as a JPEG
// Blob (uploaded to object storage). Keeps crowd photos small either way.

export type EncodeOpts = { maxEdge?: number; quality?: number; maxChars?: number }

async function drawDownscaled(file: File, maxEdge: number): Promise<HTMLCanvasElement> {
  const img = await loadImage(file)
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')
  ctx.drawImage(img, 0, 0, w, h)
  if ('close' in img && typeof img.close === 'function') img.close()
  return canvas
}

// Inline data URL (local / no object storage). Steps quality down to fit a ceiling.
export async function fileToDownscaledDataUrl(file: File, opts: EncodeOpts = {}): Promise<string> {
  const canvas = await drawDownscaled(file, opts.maxEdge ?? 1280)
  const maxChars = opts.maxChars ?? 480_000 // ~360 KB of binary once base64-decoded
  let q = opts.quality ?? 0.78
  let url = canvas.toDataURL('image/jpeg', q)
  while (url.length > maxChars && q > 0.35) {
    q -= 0.12
    url = canvas.toDataURL('image/jpeg', q)
  }
  return url
}

// JPEG Blob for upload to object storage (Vercel Blob). Larger edge is fine since
// it isn't stored inline in a DB row.
export async function fileToDownscaledBlob(file: File, opts: EncodeOpts = {}): Promise<Blob> {
  const canvas = await drawDownscaled(file, opts.maxEdge ?? 1600)
  const quality = opts.quality ?? 0.82
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', quality)
  })
}

function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') return createImageBitmap(file)
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode failed')) }
    img.src = url
  })
}
