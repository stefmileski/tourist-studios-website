// Helpers for Vimeo URLs. Unlisted videos carry a privacy hash as a second
// path segment (vimeo.com/<id>/<hash>) that the player needs as ?h= and the
// oEmbed API needs in the canonical URL.

export function parseVimeoUrl(url: string | null | undefined): { id: string; hash?: string } | null {
  if (!url) return null
  const match = url.match(/vimeo\.com\/(\d+)(?:\/([a-zA-Z0-9]+))?/)
  if (!match) return null
  return { id: match[1], hash: match[2] }
}

export function vimeoPlayerSrc(
  url: string | null | undefined,
  opts?: { background?: boolean; startAt?: number }
): string | null {
  const parsed = parseVimeoUrl(url)
  if (!parsed) return null
  const params = new URLSearchParams()
  if (parsed.hash) params.set('h', parsed.hash)
  if (opts?.background) {
    // Chromeless, muted, autoplaying loop — used for hover previews
    params.set('background', '1')
    params.set('autoplay', '1')
    params.set('muted', '1')
    params.set('loop', '1')
  }
  const qs = params.toString()
  const frag = opts?.startAt && opts.startAt > 0 ? `#t=${Math.floor(opts.startAt)}s` : ''
  return `https://player.vimeo.com/video/${parsed.id}${qs ? `?${qs}` : ''}${frag}`
}

export interface VimeoMeta {
  thumbnailUrl: string | null
  duration: number | null
}

const EMPTY_META: VimeoMeta = { thumbnailUrl: null, duration: null }

// Warm-instance memo. Avoids Next's fetch data cache entirely — its options
// conflict with dynamic (revalidate = 0) routes — while still keeping repeat
// page loads on a warm lambda free of oEmbed round-trips.
const metaCache = new Map<string, { meta: VimeoMeta; at: number }>()
const META_TTL_MS = 24 * 60 * 60 * 1000

export async function getVimeoMeta(url: string | null | undefined): Promise<VimeoMeta> {
  const parsed = parseVimeoUrl(url)
  if (!parsed) return EMPTY_META
  const canonical = `https://vimeo.com/${parsed.id}${parsed.hash ? `/${parsed.hash}` : ''}`

  const cached = metaCache.get(canonical)
  if (cached && Date.now() - cached.at < META_TTL_MS) return cached.meta

  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(canonical)}&width=640`,
      {
        cache: 'no-store',
        headers: {
          // Vimeo rejects some requests with a default runtime user agent
          'User-Agent': 'Mozilla/5.0 (compatible; TouristStudios/1.0; +https://touriststudios.com.au)',
          'Accept': 'application/json',
        },
      }
    )
    if (!res.ok) {
      console.warn(`vimeo oembed ${res.status} for video ${parsed.id}`)
      return EMPTY_META
    }
    const data = await res.json()
    const meta: VimeoMeta = {
      thumbnailUrl: typeof data.thumbnail_url === 'string' ? data.thumbnail_url : null,
      duration: typeof data.duration === 'number' ? data.duration : null,
    }
    if (!meta.thumbnailUrl) {
      console.warn(`vimeo oembed no thumbnail for ${parsed.id}:`, JSON.stringify(data).slice(0, 600))
    }
    metaCache.set(canonical, { meta, at: Date.now() })
    return meta
  } catch (err) {
    console.warn(`vimeo oembed failed for video ${parsed.id}:`, err instanceof Error ? err.message : err)
    return EMPTY_META
  }
}

// Run tasks with bounded concurrency so 80+ oEmbed lookups don't hammer
// Vimeo (or trip its rate limiting) in a single burst.
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  })
  await Promise.all(workers)
  return results
}
