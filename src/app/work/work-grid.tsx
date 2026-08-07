'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'

interface WorkProject {
  _id: string
  title: string
  year: number
  category: string
  client?: string
  vimeoId: string
  vimeoUrl: string
  slug: string
  heroImage?: string
  tags?: string[]
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

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.filterSection}>
          <input
            type="text"
            placeholder="Search by title or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterSection}>
          <h3 className={styles.filterLabel}>Category</h3>
          <div className={styles.filterOptions}>
            <button
              onClick={() => setActiveCategory(null)}
              className={`${styles.filterOption} ${!activeCategory ? styles.active : ''}`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`${styles.filterOption} ${activeCategory === cat ? styles.active : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h3 className={styles.filterLabel}>Year</h3>
          <div className={styles.filterOptions}>
            <button
              onClick={() => setActiveYear(null)}
              className={`${styles.filterOption} ${!activeYear ? styles.active : ''}`}
            >
              All Years
            </button>
            {years.map(year => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`${styles.filterOption} ${activeYear === year ? styles.active : ''}`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.resultCount}>
        Showing <span className={styles.mono}>{filteredProjects.length}</span> of <span className={styles.mono}>{projects.length}</span>
      </div>

      <div className={styles.grid}>
        {filteredProjects.map((p) => (
          <Link key={p._id} href={`/work/${p.slug}`} className={styles.card}>
            <div className={styles.thumb}>
              {p.heroImage ? (
                <Image src={p.heroImage} alt={p.title} fill style={{ objectFit: 'cover' }} />
              ) : (
                <div className={styles.thumbPlaceholder}>
                  <span>{p.year}</span>
                </div>
              )}
              <div className={styles.projectNumber}>
                <span className={styles.mono}>{projectNumbers.get(p._id)}</span>
              </div>
            </div>
            <div className={styles.cardMeta}>
              <div>
                <p className={styles.cardTitle}>{p.title}</p>
                <p className={styles.cardSub}>{p.client || 'Solo'} — {p.year}</p>
              </div>
              <div className={styles.cardCat}>
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
