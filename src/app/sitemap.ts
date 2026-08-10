import type { MetadataRoute } from 'next'
import { client, projectsQuery } from '@/lib/sanity'

export const revalidate = 3600

const BASE = 'https://www.touriststudios.com.au'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let projects: any[] = []
  try { projects = await client.fetch(projectsQuery) } catch {}
  return [
    { url: BASE, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/work`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    ...projects.map((p: any) => ({
      url: `${BASE}/work/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
