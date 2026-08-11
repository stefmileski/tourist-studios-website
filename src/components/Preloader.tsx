'use client'

import { useEffect, useState } from 'react'
import Wordmark from './Wordmark'
import styles from './Preloader.module.css'

// Full-screen splash shown while a media-heavy page gets its first assets in.
// Controlled mode: pass `ready` and the splash fades once it turns true.
// Uncontrolled mode: omit `ready` and it fades on the window load event.
// Either way a hard timeout guarantees it clears, and it only appears on
// hard loads — client-side navigations (readyState already 'complete') skip
// it entirely. `skipKey` limits it to once per tab session.
export default function Preloader({
  ready,
  maxMs = 3500,
  skipKey,
}: {
  ready?: boolean
  maxMs?: number
  skipKey?: string
}) {
  const [show] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true
    return document.readyState !== 'complete'
  })
  const [booted, setBooted] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!show) {
      setGone(true)
      return
    }
    if (skipKey && sessionStorage.getItem(skipKey)) {
      setBooted(true)
      setGone(true)
      return
    }
    const cap = setTimeout(() => setBooted(true), maxMs)
    let onLoad: (() => void) | undefined
    if (ready === undefined) {
      onLoad = () => setBooted(true)
      if (document.readyState === 'complete') onLoad()
      else window.addEventListener('load', onLoad)
    }
    return () => {
      clearTimeout(cap)
      if (onLoad) window.removeEventListener('load', onLoad)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (ready) setBooted(true)
  }, [ready])

  useEffect(() => {
    if (!booted) return
    if (skipKey) sessionStorage.setItem(skipKey, '1')
    const t = setTimeout(() => setGone(true), 700)
    return () => clearTimeout(t)
  }, [booted, skipKey])

  if (gone) return null
  return (
    <div
      className={`${styles.loader} ${booted ? styles.loaderDone : ''}`}
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
