'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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

const HERO_ROTATE_SECONDS = 10

function Thumb({
  p,
  playing,
  mounted,
  className,
  src,
}: {
  p: ShowcaseProject
  playing: boolean
  mounted: boolean
  className?: string
  src?: string | null
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
        />
      )}
    </div>
  )
}

export function HomeShowcase({
  hero,
  projects,
  headline,
  services,
  total,
}: {
  hero: ShowcaseProject | null
  projects: ShowcaseProject[]
  headline: string
  services: string[]
  total: number
}) {
  const { register, nearIds, inViewIds } = useScrollAutoplay([projects])

  // The hero rotates randomly through the whole selected-works pool
  const heroPool = useMemo(
    () => (hero ? [hero, ...projects] : projects).filter(p => p.heroSrc || p.previewSrc),
    [hero, projects]
  )
  const [heroIdx, setHeroIdx] = useState(0)
  useEffect(() => {
    if (heroPool.length < 2) return
    const id = setInterval(() => {
      setHeroIdx(prev => {
        let next = prev
        while (next === prev) next = Math.floor(Math.random() * heroPool.length)
        return next
      })
    }, HERO_ROTATE_SECONDS * 1000)
    return () => clearInterval(id)
  }, [heroPool])
  const nowShowing = heroPool[heroIdx] ?? null

  return (
    <div className={styles.page}>
      {/* Hero — full bleed, rotating through the selected works */}
      {nowShowing && (
        <section className={styles.hero} ref={register('hero')}>
          <div key={nowShowing._id} className={`${styles.heroMedia} ${styles.heroFade}`}>
            <Thumb
              p={nowShowing}
              src={nowShowing.heroSrc ?? nowShowing.previewSrc}
              mounted={nearIds.has('hero')}
              playing={inViewIds.has('hero')}
            />
          </div>
          <div className={styles.heroScrim} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroHeadline}>
              {headline.split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h1>
          </div>
          <Link
            key={`credit-${nowShowing._id}`}
            href={`/work/${nowShowing.slug}`}
            className={`${styles.heroCredit} ${styles.heroFadeText}`}
          >
            <span className={styles.heroCreditLabel}>Now showing</span>
            <span className={styles.heroCreditTitle}>{nowShowing.title}</span>
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
