'use client'

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
}

function Thumb({
  p,
  playing,
  mounted,
  className,
}: {
  p: ShowcaseProject
  playing: boolean
  mounted: boolean
  className?: string
}) {
  return (
    <div className={`${styles.media} ${className ?? ''}`}>
      {p.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.thumbnailUrl} alt={p.title} className={styles.mediaImg} loading="lazy" />
      ) : (
        <div className={styles.mediaPlaceholder}><span>{p.year}</span></div>
      )}
      {p.previewSrc && mounted && (
        <PreviewFrame
          src={p.previewSrc}
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

  return (
    <div className={styles.page}>
      {/* Hero — the newest featured film, full bleed */}
      {hero && (
        <section className={styles.hero} ref={register(hero._id)}>
          <Thumb
            p={hero}
            mounted={nearIds.has(hero._id)}
            playing={inViewIds.has(hero._id)}
            className={styles.heroMedia}
          />
          <div className={styles.heroScrim} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroHeadline}>
              {headline.split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h1>
          </div>
          <Link href={`/work/${hero.slug}`} className={styles.heroCredit}>
            <span className={styles.heroCreditLabel}>Now showing</span>
            <span className={styles.heroCreditTitle}>{hero.title}</span>
            <span className={styles.heroCreditSub}>
              {hero.client || '—'} — {hero.year} · Watch →
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
