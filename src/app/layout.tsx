import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'CloudtoTerra — an atlas of dormant ground',
  description:
    'An open, public-good crowd map of dormant land, buildings, civic assets, and the societies reactivating them.',
}

const NAV = [
  { href: '/map', label: 'Map' },
  { href: '/places', label: 'Places' },
  { href: '/about', label: 'About' },
  { href: '/admin', label: 'Admin' },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between px-5">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="text-sm font-semibold tracking-tight">CloudtoTerra</span>
            <span className="meta hidden sm:inline">Public Atlas of Dormant Ground</span>
          </Link>
          <nav className="flex items-center gap-4">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="meta transition-colors hover:text-[color:var(--color-accent)]">
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
