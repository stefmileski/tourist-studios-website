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
}: {
  src: string
  start: number
  playing: boolean
  className?: string
}) {
  const ref = useRef<HTMLIFrameElement>(null)
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
      style={{ opacity: playing ? 1 : 0, transition: 'opacity 0.3s' }}
      tabIndex={-1}
      aria-hidden="true"
    />
  )
}

// Scroll-driven autoplay state: elements registered by id are watched by two
// IntersectionObservers — a wide one (three viewport-heights) that mounts
// players early so they buffer ahead of the scroll, and a nearer one that
// actually plays them, pausing again once scrolled well past.
export function useScrollAutoplay(deps: unknown[] = []) {
  const [nearIds, setNearIds] = useState<Set<string>>(new Set())
  const [inViewIds, setInViewIds] = useState<Set<string>>(new Set())
  const els = useRef(new Map<string, HTMLElement>())

  const register = (id: string) => (el: HTMLElement | null) => {
    if (el) {
      el.dataset.previewId = id
      els.current.set(id, el)
    } else {
      els.current.delete(id)
    }
  }

  useEffect(() => {
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
    const near = new IntersectionObserver(track(setNearIds), { rootMargin: '300% 0px' })
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
  }, deps)

  return { register, nearIds, inViewIds }
}
