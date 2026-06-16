import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Not found</h1>
      <p className="mt-3 text-gray-600">
        This place isn’t on the map — it may be pending review or no longer listed.
      </p>
      <Link href="/map" className="mt-6 inline-block rounded-full bg-black px-5 py-2.5 text-sm text-white hover:bg-gray-800">
        Back to the map
      </Link>
    </div>
  )
}
