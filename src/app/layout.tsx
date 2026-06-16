import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'CloudtoTerra — from cloud to land',
  description:
    'An open, public-good crowd map of dormant land, buildings and civic assets waiting to be reactivated.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <Link href="/" className="font-semibold tracking-tight">
            Cloud<span className="text-amber-700">to</span>Terra
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/map" className="hover:underline">Map</Link>
            <Link href="/places" className="hover:underline">Places</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/admin" className="text-gray-600 hover:underline">Admin</Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
