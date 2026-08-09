'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'

export interface WorkProject {
  _id: string
  title: string
  year: number
  category: string
  client?: string
  videoUrl?: string | null
  slug: string
  heroImage?: string
  thumbnailUrl?: string | null
  previewSrc?: string | null
  previewStart?: number
}

const PREVIEW_LOOP_SECONDS = 10

// Preview player that loops a short window: the src starts the video at
// previewStart (#t=), and every ~10s we seek back there via the player's
// postMessage API. loop=1 on the src remains a whole-video fallback if the
// message is ever ignored. While `playing` is false the player is held
// paused (retried each second — the player may not be ready for the first
// message), which lets it mount early and buffer before scrolling into view.
function PreviewFrame({ src, start, playing }: { src: string; start: number; playing: boolean }) {
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
      className={styles.previewFrame}
      style={{ opacity: playing ? 1 : 0, transition: 'opacity 0.3s' }}
      tabIndex={-1}
      aria-hidden="true"
    />
  )
}

const CATEGORIES = [
  'Commercial/Brand', 'Product', 'Fashion', 'Art/Cultural', 'Documentary',
  'Narrative', 'Music/Art', 'Music/Branded', 'Comedy', 'Branded',
  'Architecture/Design', 'Automotive/TVC', 'Event/Sport', 'Lifestyle/Editorial'
]

export function WorkGrid({ projects, projectNumbers }: { projects: WorkProject[]; projectNumbers: Map<string, string> }) {
  const [search, setSearch] = useState<string>('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeYear, setActiveYear] = useState<number | null>(null)
  // Scroll-driven preview state: cards near the viewport mount their player
  // so it buffers ahead of arrival; cards in (or nearly in) view play, and
  // pause again once scrolled past.
  const [nearIds, setNearIds] = useState<Set<string>>(new Set())
  const [inViewIds, setInViewIds] = useState<Set<string>>(new Set())
  const cardEls = useRef(new Map<string, HTMLElement>())

  // Only offer categories that actually have films
  const categories = useMemo(() => {
    const present = new Set(projects.map(p => p.category))
    return CATEGORIES.filter(c => present.has(c))
  }, [projects])

  // Get unique years from projects
  const years = useMemo(() => {
    return Array.from(new Set(projects.map(p => p.year))).sort((a, b) => b - a)
  }, [projects])

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.client?.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !activeCategory || p.category === activeCategory
      const matchesYear = !activeYear || p.year === activeYear
      return matchesSearch && matchesCategory && matchesYear
    })
  }, [projects, search, activeCategory, activeYear])

  useEffect(() => {
    const idOf = (el: Element) => (el as HTMLElement).dataset.projectId as string
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
    // Three viewport-heights of lookahead buffers previews well before they
    // scroll in, and playback starts most of a screen early so fast scrolling
    // lands on cards that are already playing
    const near = new IntersectionObserver(track(setNearIds), { rootMargin: '300% 0px' })
    const inView = new IntersectionObserver(track(setInViewIds), { rootMargin: '75% 0px' })
    cardEls.current.forEach((el) => {
      near.observe(el)
      inView.observe(el)
    })
    return () => {
      near.disconnect()
      inView.disconnect()
    }
  }, [filteredProjects])

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <input
            type="text"
            placeholder="Search by title or client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.resultCount}>
            Showing <span className={styles.mono}>{filteredProjects.length}</span> of <span className={styles.mono}>{projects.length}</span>
          </span>
        </div>

        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Category</span>
          <div className={styles.filterOptions}>
            <button
              onClick={() => setActiveCategory(null)}
              className={`${styles.filterOption} ${!activeCategory ? styles.active : ''}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`${styles.filterOption} ${activeCategory === cat ? styles.active : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Year</span>
          <div className={styles.filterOptions}>
            <button
              onClick={() => setActiveYear(null)}
              className={`${styles.filterOption} ${!activeYear ? styles.active : ''}`}
            >
              All
            </button>
            {years.map(year => (
              <button
                key={year}
                onClick={() => setActiveYear(activeYear === year ? null : year)}
                className={`${styles.filterOption} ${activeYear === year ? styles.active : ''}`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredProjects.map((p) => (
          <Link
            key={p._id}
            href={`/work/${p.slug}`}
            className={styles.card}
            data-project-id={p._id}
            ref={(el) => {
              if (el) cardEls.current.set(p._id, el)
              else cardEls.current.delete(p._id)
            }}
          >
            <div className={styles.thumb}>
              {p.heroImage ? (
                <Image src={p.heroImage} alt={p.title} fill style={{ objectFit: 'cover' }} />
              ) : p.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.thumbnailUrl} alt={p.title} className={styles.thumbImg} loading="lazy" />
              ) : (
                <div className={styles.thumbPlaceholder}>
                  <span>{p.year}</span>
                </div>
              )}
              {p.previewSrc && nearIds.has(p._id) && (
                <PreviewFrame
                  src={p.previewSrc}
                  start={p.previewStart ?? 0}
                  playing={inViewIds.has(p._id)}
                />
              )}
              <div className={styles.cardNumOverlay}>
                <span className={styles.mono}>{projectNumbers.get(p._id)}</span>
              </div>
            </div>
            <div className={styles.cardMeta}>
              <div>
                <p className={styles.cardTitle}>{p.title}</p>
                <p className={styles.cardSub}>{p.client || '—'} — {p.year}</p>
              </div>
              <div className={styles.cardCats}>
                <span className={styles.cat}>{p.category}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className={styles.empty}>
          <p>No films match your filters.</p>
        </div>
      )}
    </>
  )
}
