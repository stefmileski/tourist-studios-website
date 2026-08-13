'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Wordmark from './Wordmark'
import styles from './PageTransition.module.css'

// Outgoing half of the page transition: tapping an internal link dissolves
// the loading screen IN over the current page while the next route loads.
// Once the destination renders, its own Preloader (visually identical, one
// layer below) is already covering the screen, so this overlay quietly fades
// away and the Preloader finishes the sequence.
export default function PageTransition() {
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const [shown, setShown] = useState(false)
  const failsafe = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href || !href.startsWith('/')) return
      if (a.target && a.target !== '_self') return
      // Same-page links (anchors, active filters) shouldn't flash the splash
      if (href.split(/[?#]/)[0] === window.location.pathname) return
      setActive(true)
      // Double rAF so the overlay commits at opacity 0 before fading in
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      // If navigation never lands (blocked, same route), clear ourselves
      if (failsafe.current) clearTimeout(failsafe.current)
      failsafe.current = setTimeout(() => {
        setShown(false)
        setTimeout(() => setActive(false), 500)
      }, 3000)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  // Destination arrived — its Preloader is covering the screen underneath,
  // so hand off with a short crossfade
  useEffect(() => {
    if (!active) return
    if (failsafe.current) clearTimeout(failsafe.current)
    const fade = setTimeout(() => setShown(false), 200)
    const clear = setTimeout(() => setActive(false), 700)
    return () => {
      clearTimeout(fade)
      clearTimeout(clear)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (!active) return null
  return (
    <div className={`${styles.overlay} ${shown ? styles.overlayShown : ''}`} aria-hidden="true">
      <div className={styles.mark}>
        <Wordmark color="var(--crimson)" width={220} stacked={false} />
      </div>
      <span className={styles.label}>Now loading</span>
    </div>
  )
}
