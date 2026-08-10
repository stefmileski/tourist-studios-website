import { client, projectsQuery, settingsQuery } from '@/lib/sanity'
import { getVimeoMeta, mapWithConcurrency, vimeoPlayerSrc } from '@/lib/vimeo'
import { HomeShowcase, type ShowcaseProject } from './home-showcase'

export const revalidate = 0

const DEFAULTS = {
  heroHeadline: 'We make things\nworth watching.',
  heroSub: 'Tourist Studios is a boutique production company.\nFilm, photography, and creative direction — Bondi to everywhere.',
  services: ['Commercial Film', 'Brand Photography', 'Real Estate Video', 'Creative Direction', 'Post Production'],
}

const SHOWCASE_COUNT = 12

async function getProjects() {
  try { return await client.fetch(projectsQuery) } catch { return [] }
}

async function getSettings() {
  try { return await client.fetch(settingsQuery) } catch { return null }
}

export default async function HomePage() {
  const [allProjects, settings] = await Promise.all([getProjects(), getSettings()])

  const headline = settings?.heroHeadline || DEFAULTS.heroHeadline
  const services = settings?.services?.length ? settings.services : DEFAULTS.services

  // The work leads: featured films come first — ordered by their Homepage
  // Order field when set, then newest year — topped up with the newest
  // non-featured films.
  const newestFirst = (a: any, b: any) => (b.year ?? 0) - (a.year ?? 0)
  const byHomepageOrder = (a: any, b: any) => {
    const ao = a.homepageOrder ?? Infinity
    const bo = b.homepageOrder ?? Infinity
    return ao !== bo ? ao - bo : newestFirst(a, b)
  }
  const ordered = [
    ...allProjects.filter((p: any) => p.featured).sort(byHomepageOrder),
    ...allProjects.filter((p: any) => !p.featured).sort(newestFirst),
  ]
  const picks = ordered.slice(0, 1 + SHOWCASE_COUNT)

  const enriched: ShowcaseProject[] = await mapWithConcurrency(picks, 10, async (p: any) => {
    const meta = await getVimeoMeta(p.videoUrl)
    const previewStart = meta.duration ? Math.floor(meta.duration * 0.25) : 0
    const base = { background: true, startAt: previewStart } as const
    return {
      _id: p._id,
      title: p.title,
      client: p.client ?? null,
      year: p.year,
      category: p.category ?? null,
      slug: p.slug,
      thumbnailUrl: meta.thumbnailUrl,
      previewStart,
      previewSrc: vimeoPlayerSrc(p.videoUrl, { ...base, quality: '360p' }),
      // Every project can take a turn in the full-bleed hero, which wants a
      // sharper stream
      heroSrc: vimeoPlayerSrc(p.videoUrl, { ...base, quality: '720p' }),
    }
  })

  const [hero, ...showcase] = enriched

  return (
    <HomeShowcase
      hero={hero ?? null}
      projects={showcase}
      headline={headline}
      services={services}
      total={allProjects.length}
    />
  )
}
