import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/unlock', '/api/'],
    },
    sitemap: 'https://www.touriststudios.com.au/sitemap.xml',
  }
}
