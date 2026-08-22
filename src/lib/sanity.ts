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
export const projectsQuery = `*[_type == "project"] | order(year desc, title asc) {
  _id,
  title,
  year,
  category,
  client,
  "videoUrl": coalesce(videoUrl, vimeoUrl),
  "slug": slug.current,
  "heroImage": heroImage.asset->url,
  "gallery": gallery[].asset->url,
  services,
  featured,
  homepageOrder
}`

// Total count of projects (for numbering)
export const projectCountQuery = `count(*[_type == "project"])`

// Query to get project position for numbering (oldest first)
export const projectPositionQuery = `{
  "position": count(*[_type == "project" && (year < $year or (year == $year && title < $title))]) + 1,
  "total": count(*[_type == "project"])
}`

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0] {
  _id,
  title,
  year,
  category,
  client,
  description,
  "videoUrl": coalesce(videoUrl, vimeoUrl),
  "slug": slug.current,
  "heroImage": heroImage.asset->url,
  "gallery": gallery[].asset->url,
  services,
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

// The colour fields in Settings are free-text strings, so a value can reach us
// without its leading '#', in shorthand, or with stray whitespace. Interpolating
// one of those straight into a custom property (`--mid:3E0400`) is invalid CSS
// that fails silently at the use site, so every colour is normalised to a full
// `#rrggbb` — or dropped for the brand default — before it is used.
export function normalizeHex(value: string | null | undefined, fallback: string): string {
  const h = (value ?? '').trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(h)) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
  if (/^[0-9a-f]{6}$/i.test(h)) return `#${h}`
  return fallback
}

// Helper — hex colour → rgba string (used for derived rule/border colours)
export function hexToRgba(hex: string, alpha: number): string {
  const h = normalizeHex(hex, '#000000').slice(1)
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// Build a CSS :root block from settings, falling back to brand defaults
export function buildThemeCSS(s: Record<string, string> | null): string {
  const ink    = normalizeHex(s?.colorInk,    '#0E0C0A')
  const cream  = normalizeHex(s?.colorCream,  '#ECE5D6')
  const accent = normalizeHex(s?.colorAccent, '#3E0306')
  const mid    = normalizeHex(s?.colorMid,    '#6B6560')
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
