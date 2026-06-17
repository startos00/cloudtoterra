import { Explore } from '@/components/Explore'

export default async function Home({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams
  return <Explore initialView={view === 'grid' ? 'grid' : 'map'} />
}
