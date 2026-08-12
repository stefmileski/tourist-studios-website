'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PreviewFrame, useScrollAutoplay } from '@/components/ScrollPreviews'
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

const CATEGORIES = [
  'Commercial/Brand', 'Product', 'Fashion', 'Art/Cultural', 'Documentary',
  'Narrative', 'Music/Art', 'Music/Branded', 'Comedy', 'Branded',
  'Architecture/Design', 'Automotive/TVC', 'Event/Sport', 'Lifestyle/Editorial'
]

// Filters survive navigating into a film and back (per-tab), so the archive
// picks up exactly where the user left it
const FILTER_STATE_KEY = 'ts-work-filters'

export function WorkGrid({ projects, projectNumbers }: { projects: WorkProject[]; projectNumbers: Map<string, string> }) {
  const [search, setSearch] = useState<string>('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeYear, setActiveYear] = useState<number | null>(null)
  const [restored, setRestored] = useState(false)
  const [compact, setCompact] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)

  // Mobile gets shorter dropdown labels so the one-row filter bar leaves
  // room for the search field
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setCompact(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Restore saved filters after hydration (reading storage during render
  // would mismatch the server HTML)
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(FILTER_STATE_KEY) ?? 'null')
      if (saved) {
        if (typeof saved.search === 'string') setSearch(saved.search)
        if (typeof saved.category === 'string') setActiveCategory(saved.category)
        if (typeof saved.year === 'number') setActiveYear(saved.year)
      }
    } catch { /* corrupted state — start clean */ }
    setRestored(true)
  }, [])

  useEffect(() => {
    if (!restored) return
    try {
      sessionStorage.setItem(
        FILTER_STATE_KEY,
        JSON.stringify({ search, category: activeCategory, year: activeYear })
      )
    } catch { /* storage unavailable — filters just won't persist */ }
  }, [restored, search, activeCategory, activeYear])

  // Changing any filter jumps back to the top of the grid so the new results
  // are in view no matter how far down the page was scrolled
  const snapToResults = () => {
    const el = filtersRef.current
    if (!el) return
    const stickyTop = parseFloat(getComputedStyle(el).top) || 0
    const pinned = el.getBoundingClientRect().top + window.scrollY - stickyTop
    if (window.scrollY > pinned) window.scrollTo({ top: pinned })
  }

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

  const { register, nearIds, inViewIds } = useScrollAutoplay([filteredProjects])

  return (
    <>
      <div className={styles.filters} ref={filtersRef}>
        <div className={styles.filterBar}>
          <input
            type="text"
            placeholder="Search by title or client…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); snapToResults() }}
            className={styles.searchInput}
          />
          <select
            value={activeCategory ?? ''}
            onChange={(e) => { setActiveCategory(e.target.value || null); snapToResults() }}
            className={styles.filterSelect}
            aria-label="Filter by category"
          >
            <option value="">{compact ? 'Category' : 'All categories'}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={activeYear ?? ''}
            onChange={(e) => { setActiveYear(e.target.value ? Number(e.target.value) : null); snapToResults() }}
            className={styles.filterSelect}
            aria-label="Filter by year"
          >
            <option value="">{compact ? 'Year' : 'All years'}</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <span className={styles.resultCount}>
            Showing <span className={styles.mono}>{filteredProjects.length}</span> of <span className={styles.mono}>{projects.length}</span>
          </span>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredProjects.map((p) => (
          <Link
            key={p._id}
            href={`/work/${p.slug}`}
            className={styles.card}
            ref={register(p._id)}
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
                  className={styles.previewFrame}
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
