// Browser-only. Downscales an uploaded image and returns a base64 JPEG data URL,
// stepping quality down until it fits under a character ceiling. Keeps inline
// crowd photos small enough to store directly until object storage is wired.

export type EncodeOpts = { maxEdge?: number; quality?: number; maxChars?: number }

export async function fileToDownscaledDataUrl(file: File, opts: EncodeOpts = {}): Promise<string> {
  const maxEdge = opts.maxEdge ?? 1280
  const maxChars = opts.maxChars ?? 480_000 // ~360 KB of binary once base64-decoded
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

  let q = opts.quality ?? 0.78
  let url = canvas.toDataURL('image/jpeg', q)
  while (url.length > maxChars && q > 0.35) {
    q -= 0.12
    url = canvas.toDataURL('image/jpeg', q)
  }
  return url
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
