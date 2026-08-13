'use client'

import { useEffect, useRef, useState } from 'react'

const PREVIEW_LOOP_SECONDS = 10

// Preview player that loops a short window: the src starts the video at
// `start` (#t=), and every ~10s we seek back there via the player's
// postMessage API. loop=1 on the src remains a whole-video fallback if the
// message is ever ignored. While `playing` is false the player is held
// paused (retried each second — the player may not be ready for the first
// message), which lets it mount early and buffer before scrolling into view.
export function PreviewFrame({
  src,
  start,
  playing,
  className,
  onPlaying,
}: {
  src: string
  start: number
  playing: boolean
  className?: string
  // Fires once, when the player reports actual playback (used by the
  // homepage preloader to know the hero is rolling)
  onPlaying?: () => void
}) {
  const ref = useRef<HTMLIFrameElement>(null)
  // The iframe stays invisible (poster showing through) until the player
  // reports real playback, so a buffering stream never paints a black box
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return
    let fired = false
    let tries = 0
    // The player ignores subscriptions until it's ready, so re-send a few times
    const sub = setInterval(() => {
      if (++tries > 20) { clearInterval(sub); return }
      for (const ev of ['play', 'playing', 'timeupdate']) {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ method: 'addEventListener', value: ev }),
          'https://player.vimeo.com'
        )
      }
    }, 400)
    const onMsg = (e: MessageEvent) => {
      if (e.source !== iframe.contentWindow || fired) return
      let data: any = e.data
      if (typeof data === 'string') { try { data = JSON.parse(data) } catch { return } }
      if (data?.event === 'play' || data?.event === 'playing' || data?.event === 'timeupdate') {
        fired = true
        clearInterval(sub)
        setStarted(true)
        onPlaying?.()
      }
    }
    window.addEventListener('message', onMsg)
    return () => {
      clearInterval(sub)
      window.removeEventListener('message', onMsg)
    }
  }, [onPlaying])

  // Safety valve: if the playback events never arrive, reveal shortly after
  // play is requested rather than hiding a working stream forever
  useEffect(() => {
    if (!playing || started) return
    const t = setTimeout(() => setStarted(true), 2500)
    return () => clearTimeout(t)
  }, [playing, started])
  useEffect(() => {
    const post = (method: string, value?: unknown) =>
      ref.current?.contentWindow?.postMessage(
        JSON.stringify(value === undefined ? { method } : { method, value }),
        'https://player.vimeo.com'
      )
    if (playing) {
      post('play')
      const id = setInterval(() => post('setCurrentTime', start), PREVIEW_LOOP_SECONDS * 1000)
      return () => clearInterval(id)
    }
    post('pause')
    const id = setInterval(() => post('pause'), 1000)
    return () => clearInterval(id)
  }, [playing, start])
  return (
    <iframe
      ref={ref}
      src={src}
      frameBorder="0"
      allow="autoplay; picture-in-picture"
      className={className}
      style={{ opacity: playing && started ? 1 : 0, transition: 'opacity 0.4s' }}
      tabIndex={-1}
      aria-hidden="true"
    />
  )
}

// True when the visitor's connection can comfortably carry autoplay video.
// Uses the Network Information API where available (Chrome/Android — where it
// matters most); browsers without it default to previews on. Visitors with
// Data Saver, 2g/3g, or sub-1.5Mbps links get thumbnails instead of streams.
function useConnectionAllowsVideo() {
  const [allowed, setAllowed] = useState(true)
  useEffect(() => {
    const conn = (navigator as any).connection
    if (!conn) return
    const check = () => {
      const type: string = conn.effectiveType || ''
      const slow =
        conn.saveData === true ||
        type === 'slow-2g' || type === '2g' || type === '3g' ||
        (typeof conn.downlink === 'number' && conn.downlink > 0 && conn.downlink < 1.5)
      setAllowed(!slow)
    }
    check()
    conn.addEventListener?.('change', check)
    return () => conn.removeEventListener?.('change', check)
  }, [])
  return allowed
}

// Scroll-driven autoplay state: elements registered by id are watched by two
// IntersectionObservers — a wide one that mounts players early so they buffer
// ahead of the scroll, and a nearer one that actually plays them, pausing
// again once scrolled well past. On connections too slow for autoplay video,
// no players mount at all and the poster thumbnails stand in.
export function useScrollAutoplay(
  deps: unknown[] = [],
  opts?: { nearMargin?: string }
) {
  const [nearIds, setNearIds] = useState<Set<string>>(new Set())
  const [inViewIds, setInViewIds] = useState<Set<string>>(new Set())
  const els = useRef(new Map<string, HTMLElement>())
  const videoAllowed = useConnectionAllowsVideo()
  const nearMargin = opts?.nearMargin ?? '300% 0px'

  const register = (id: string) => (el: HTMLElement | null) => {
    if (el) {
      el.dataset.previewId = id
      els.current.set(id, el)
    } else {
      els.current.delete(id)
    }
  }

  useEffect(() => {
    if (!videoAllowed) {
      setNearIds(new Set())
      setInViewIds(new Set())
      return
    }
    const idOf = (el: Element) => (el as HTMLElement).dataset.previewId as string
    const track = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) =>
      (entries: IntersectionObserverEntry[]) =>
        setter(prev => {
          const next = new Set(prev)
          for (const e of entries) {
            if (e.isIntersecting) next.add(idOf(e.target))
            else next.delete(idOf(e.target))
          }
          return next
        })
    const near = new IntersectionObserver(track(setNearIds), { rootMargin: nearMargin })
    const inView = new IntersectionObserver(track(setInViewIds), { rootMargin: '75% 0px' })
    els.current.forEach((el) => {
      near.observe(el)
      inView.observe(el)
    })
    return () => {
      near.disconnect()
      inView.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoAllowed, nearMargin, ...deps])

  return { register, nearIds, inViewIds }
}
