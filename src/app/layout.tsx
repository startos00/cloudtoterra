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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Global runtime <link> (root layout, applies everywhere) — avoids a build-time font fetch. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-30 border-b border-ink bg-paper">
          <div className="flex h-14 items-center justify-between px-5">
            <Link href="/" className="flex items-baseline gap-3">
              <span className="font-sans text-base font-semibold uppercase tracking-tight">CloudtoTerra</span>
              <span className="meta hidden coord sm:inline">N 42.9° · FROM CLOUD TO LAND</span>
            </Link>
            <nav className="flex items-center gap-5">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="meta transition-colors hover:bg-ink hover:text-paper">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
