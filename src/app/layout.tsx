import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { client, settingsQuery, buildThemeCSS } from '@/lib/sanity'
import '@/styles/globals.css'

export const revalidate = 0

export const metadata: Metadata = {
  title: { default: 'Tourist Studios', template: '%s — Tourist Studios' },
  description: 'Production company. Sydney, Australia. Film, photography, and creative direction.',
  metadataBase: new URL('https://touriststudios.com.au'),
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
    <html lang="en">
      <head>
        {/* Colour theme — overrides globals.css vars with values from Sanity */}
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  )
}
