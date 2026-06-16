import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'CloudtoTerra — from cloud to land',
  description:
    'An open, public-good crowd map of dormant land, buildings and civic assets waiting to be reactivated.',
}

const NAV = [
  { href: '/map', label: 'Map' },
  { href: '/places', label: 'Places' },
  { href: '/about', label: 'About' },
  { href: '/admin', label: 'Admin' },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Global runtime <link> in the root layout (applies to all routes) — deliberate over
            next/font to avoid a build-time font fetch; system fallbacks keep it safe offline. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..700&family=Public+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
            <Link href="/" className="group flex items-baseline gap-3">
              <span className="font-display text-xl font-semibold tracking-tight text-ink">
                Cloud<span className="text-ember">to</span>Terra
              </span>
              <span className="label hidden sm:inline border-l border-line pl-3 coord">
                N 42.9° · from cloud to land
              </span>
            </Link>
            <nav className="flex items-center gap-5">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="label transition-colors hover:text-ink"
                >
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
