import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://cloudtoterra.land'
  return ['', '/map', '/about'].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: 'daily',
    priority: p === '' ? 1 : 0.7,
  }))
}
