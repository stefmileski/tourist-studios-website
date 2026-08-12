import type { Metadata, Viewport } from 'next'
import { Big_Shoulders, Geist, JetBrains_Mono } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { client, settingsQuery, buildThemeCSS } from '@/lib/sanity'
import '@/styles/globals.css'

// Self-hosted variable fonts via next/font: one file per family, no
// render-blocking Google Fonts chain. (Google merged Big Shoulders Display
// into the Big Shoulders variable family.)
const fontDisplay = Big_Shoulders({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})
const fontBody = Geist({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})
const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const revalidate = 60

// Lock the page at 100% zoom on mobile — no pinch zoom, and no auto zoom-in
// when a text field is focused (the layout is designed to fit as-is)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: { default: 'Tourist Studios', template: '%s — Tourist Studios' },
  description: 'Production company. Sydney, Australia. Film, photography, and creative direction.',
  metadataBase: new URL('https://touriststudios.com.au'),
  // Google Search Console ownership token — set GOOGLE_SITE_VERIFICATION in
  // Vercel and the meta tag renders on every page
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://touriststudios.com.au',
    siteName: 'Tourist Studios',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await client.fetch(settingsQuery).catch(() => null)
  const themeCSS = buildThemeCSS(settings)

  return (
    <html lang="en" className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}>
      <head>
        {/* Colour theme — overrides globals.css vars with values from Sanity */}
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer settings={settings} />
        <Analytics />
        {/* Google Analytics — measurement IDs are public; the env var can
            override without a code change */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? 'G-98K2MBLFVL'} />
      </body>
    </html>
  )
}
