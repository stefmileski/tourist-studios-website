'use client'

import { useEffect, useState } from 'react'
import Wordmark from './Wordmark'
import styles from './Preloader.module.css'

// Full-screen splash shown while a page gets its content in. It appears on
// every arrival — hard loads and client-side navigations alike — holding for
// at least `minMs` so it reads as a beat rather than a flicker.
// Controlled mode: pass `ready` and the splash fades once it turns true.
// Uncontrolled mode: omit `ready` and it fades on the window load event
// (already fired during client-side navigations, so the minimum hold is
// what shows). Either way the `maxMs` hard timeout guarantees it clears.
export default function Preloader({
  ready,
  maxMs = 3500,
  minMs = 700,
}: {
  ready?: boolean
  maxMs?: number
  minMs?: number
}) {
  const [booted, setBooted] = useState(false)
  const [minElapsed, setMinElapsed] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const min = setTimeout(() => setMinElapsed(true), minMs)
    const cap = setTimeout(() => setBooted(true), maxMs)
    let onLoad: (() => void) | undefined
    if (ready === undefined) {
      if (document.readyState === 'complete') setBooted(true)
      else {
        onLoad = () => setBooted(true)
        window.addEventListener('load', onLoad)
      }
    }
    return () => {
      clearTimeout(min)
      clearTimeout(cap)
      if (onLoad) window.removeEventListener('load', onLoad)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (ready) setBooted(true)
  }, [ready])

  const done = booted && minElapsed
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setGone(true), 700)
    return () => clearTimeout(t)
  }, [done])

  if (gone) return null
  return (
    <div
      className={`${styles.loader} ${done ? styles.loaderDone : ''}`}
      aria-hidden="true"
      suppressHydrationWarning
    >
      <div className={styles.mark}>
        <Wordmark color="var(--crimson)" width={220} stacked={false} />
      </div>
      <span className={styles.label}>Now loading</span>
    </div>
  )
}
