'use client'

import dynamic from 'next/dynamic'

// mapbox-gl touches window — load the map only on the client.
const MapView = dynamic(() => import('@/components/MapView').then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-gray-500">Loading map…</div>,
})

export default function MapPage() {
  return (
    <div className="h-[calc(100dvh-3.5rem)] w-full">
      <MapView />
    </div>
  )
}
