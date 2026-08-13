'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Preloader from '@/components/Preloader'
import { PreviewFrame, useScrollAutoplay } from '@/components/ScrollPreviews'
import styles from './page.module.css'

export interface ShowcaseProject {
  _id: string
  title: string
  client: string | null
  year: number
  category: string | null
  slug: string
  thumbnailUrl: string | null
  previewStart: number
  previewSrc: string | null
  heroSrc?: string | null
}

// Hero rotation: every ROTATE seconds the next film slides in. It is picked
// and mounted (buffering, hidden off-screen) PRELOAD seconds beforehand so
// the slide reveals a stream that's already rolling.
const HERO_ROTATE_MS = 15_000
const HERO_PRELOAD_MS = 3_000
const HERO_SLIDE_MS = 900

function Thumb({
  p,
  playing,
  mounted,
  className,
  src,
  onPlaying,
}: {
  p: ShowcaseProject
  playing: boolean
  mounted: boolean
  className?: string
  src?: string | null
  onPlaying?: () => void
}) {
  const playerSrc = src ?? p.previewSrc
  return (
    <div className={`${styles.media} ${className ?? ''}`}>
      {p.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.thumbnailUrl} alt={p.title} className={styles.mediaImg} loading="lazy" />
      ) : (
        <div className={styles.mediaPlaceholder}><span>{p.year}</span></div>
      )}
      {playerSrc && mounted && (
        <PreviewFrame
          src={playerSrc}
          start={p.previewStart}
          playing={playing}
          className={styles.previewFrame}
          onPlaying={onPlaying}
        />
      )}
    </div>
  )
}

export function HomeShowcase({
  hero,
  projects,
  services,
  total,
}: {
  hero: ShowcaseProject | null
  projects: ShowcaseProject[]
  services: string[]
  total: number
}) {
  // A tighter preload halo than the archive: the homepage mounts 13 players,
  // so buffering 1.5 screens ahead keeps the initial load leaner
  const { register, nearIds, inViewIds } = useScrollAutoplay([projects], { nearMargin: '150% 0px' })

  // The hero walks the selected-works pool in order, starting from a random
  // film, wrapping back to the top. Projects sharing the same video (data
  // duplicates) appear once so no film gets extra turns.
  const heroPool = useMemo(() => {
    const all = (hero ? [hero, ...projects] : projects).filter(p => p.heroSrc || p.previewSrc)
    const seen = new Set<string>()
    return all.filter(p => {
      const key = p.heroSrc ?? p.previewSrc ?? p._id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [hero, projects])

  const [heroIdx, setHeroIdx] = useState(0)
  const [nextIdx, setNextIdx] = useState<number | null>(null)
  const [sliding, setSliding] = useState(false)

  // Random starting point, chosen client-side after hydration
  useEffect(() => {
    if (heroPool.length > 1) setHeroIdx(Math.floor(Math.random() * heroPool.length))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (heroPool.length < 2) return
    let slide: ReturnType<typeof setTimeout>
    let settle: ReturnType<typeof setTimeout>
    const pick = setTimeout(() => {
      const j = (heroIdx + 1) % heroPool.length
      setNextIdx(j)
      slide = setTimeout(() => setSliding(true), HERO_PRELOAD_MS)
      settle = setTimeout(() => {
        setHeroIdx(j)
        setNextIdx(null)
        setSliding(false)
      }, HERO_PRELOAD_MS + HERO_SLIDE_MS)
    }, HERO_ROTATE_MS - HERO_PRELOAD_MS)
    return () => {
      clearTimeout(pick)
      clearTimeout(slide)
      clearTimeout(settle)
    }
  }, [heroIdx, heroPool])

  const nowShowing = heroPool[heroIdx] ?? null
  const upNext = nextIdx !== null ? heroPool[nextIdx] : null

  // Splash until the hero stream reports playback (Preloader adds the
  // minimum hold and hard timeout)
  const [booted, setBooted] = useState(false)
  const markBooted = useCallback(() => setBooted(true), [])

  return (
    <div className={styles.page}>
      <Preloader ready={booted} maxMs={4000} />
      {/* Hero — full bleed, rotating through the selected works */}
      {nowShowing && (
        <section className={styles.hero} ref={register('hero')}>
          <div
            key={nowShowing._id}
            className={`${styles.heroMedia} ${sliding ? styles.heroSlideOut : ''}`}
          >
            <Thumb
              p={nowShowing}
              src={nowShowing.heroSrc ?? nowShowing.previewSrc}
              mounted={nearIds.has('hero')}
              playing={inViewIds.has('hero')}
              onPlaying={markBooted}
            />
          </div>
          {upNext && (
            <div
              key={upNext._id}
              className={`${styles.heroMedia} ${styles.heroNext} ${sliding ? styles.heroSlideIn : ''}`}
            >
              <Thumb
                p={upNext}
                src={upNext.heroSrc ?? upNext.previewSrc}
                mounted
                playing={inViewIds.has('hero')}
              />
            </div>
          )}
          <div className={styles.heroScrim} />
          <Link
            key={`credit-${nowShowing._id}`}
            href={`/work/${nowShowing.slug}`}
            className={`${styles.heroCredit} ${styles.heroFadeText}`}
          >
            <span className={styles.heroCreditLabel}>Now showing</span>
            <h1 className={styles.heroHeadline}>{nowShowing.title}</h1>
            <span className={styles.heroCreditSub}>
              {nowShowing.client || '—'} — {nowShowing.year} · Watch →
            </span>
          </Link>
        </section>
      )}

      {/* Showcase mosaic — the work leads */}
      <section className={styles.showcase}>
        <div className={styles.showcaseHeader}>
          <span className={styles.sectionTag}>Selected works</span>
          <Link href="/work" className={styles.sectionLink}>
            Full archive ({total}) →
          </Link>
        </div>
        <div className={styles.mosaic}>
          {projects.map((p, i) => (
            <Link
              key={p._id}
              href={`/work/${p.slug}`}
              className={styles.tile}
              ref={register(p._id)}
            >
              <Thumb
                p={p}
                mounted={nearIds.has(p._id)}
                playing={inViewIds.has(p._id)}
              />
              <div className={styles.tileScrim} />
              <div className={styles.tileMeta}>
                <span className={styles.tileNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.tileTitle}>{p.title}</span>
                <span className={styles.tileSub}>{p.client || '—'} — {p.year}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className={styles.archiveCta}>
          <Link href="/work" className={styles.archiveLink}>
            View full archive — {total} films →
          </Link>
        </div>
      </section>

      {/* Services strip */}
      <section className={styles.services}>
        {services.map((s) => (
          <span key={s} className={styles.serviceItem}>{s}</span>
        ))}
      </section>
    </div>
  )
}
