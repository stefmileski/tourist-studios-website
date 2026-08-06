import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // SSR — always fetch fresh from Sanity API
})

const builder = imageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)

// Queries
export const projectsQuery = `*[_type == "project"] | order(projectNumber desc) {
  _id,
  title,
  projectNumber,
  client,
  year,
  categories,
  "slug": slug.current,
  "coverImage": coverImage.asset->url,
  featured
}`

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0] {
  _id,
  title,
  projectNumber,
  client,
  year,
  categories,
  description,
  services,
  "slug": slug.current,
  "coverImage": coverImage.asset->url,
  "gallery": gallery[].asset->url,
  videoUrl,
  featured
}`

export const settingsQuery = `*[_type == "settings"][0] {
  heroHeadline,
  heroSub,
  services,
  aboutLead,
  aboutHowWeWork,
  aboutClients,
  contactSub,
  contactAvailability,
  contactLocation,
  email,
  phone,
  instagram,
  vimeo,
  colorInk,
  colorCream,
  colorAccent,
  colorMid,
}`

// Helper — hex colour → rgba string (used for derived rule/border colours)
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// Build a CSS :root block from settings, falling back to brand defaults
export function buildThemeCSS(s: Record<string, string> | null): string {
  const ink    = s?.colorInk    || '#0E0C0A'
  const cream  = s?.colorCream  || '#ECE5D6'
  const accent = s?.colorAccent || '#3E0306'
  const mid    = s?.colorMid    || '#6B6560'
  return `:root{--ink:${ink};--cream:${cream};--crimson:${accent};--mid:${mid};--rule:${hexToRgba(cream, 0.12)};--rule-dark:${hexToRgba(ink, 0.12)};}`
}

export const postsQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  "coverImage": coverImage.asset->url
}`
