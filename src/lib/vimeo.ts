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

export async function getVimeoMeta(url: string | null | undefined): Promise<VimeoMeta> {
  const parsed = parseVimeoUrl(url)
  if (!parsed) return { thumbnailUrl: null, duration: null }
  const canonical = `https://vimeo.com/${parsed.id}${parsed.hash ? `/${parsed.hash}` : ''}`
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(canonical)}&width=640`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return { thumbnailUrl: null, duration: null }
    const data = await res.json()
    return {
      thumbnailUrl: typeof data.thumbnail_url === 'string' ? data.thumbnail_url : null,
      duration: typeof data.duration === 'number' ? data.duration : null,
    }
  } catch {
    return { thumbnailUrl: null, duration: null }
  }
}
