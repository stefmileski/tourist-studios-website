import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { client, projectsQuery } from '@/lib/sanity'
import styles from './page.module.css'

export const revalidate = 0
export const metadata: Metadata = { title: 'Work' }

const DEMO_PROJECTS = [
  { _id: '1', projectNumber: 1, title: 'Young Academics — Brand Film', client: 'Young Academics', year: 2024, categories: ['Film', 'Photography'], slug: 'young-academics', coverImage: null },
  { _id: '2', projectNumber: 2, title: 'SOMOS — Campaign', client: 'SOMOS', year: 2024, categories: ['Campaign', 'Direction'], slug: 'somos', coverImage: null },
  { _id: '3', projectNumber: 3, title: 'Fluidform — Studio Series', client: 'Fluidform Pilates', year: 2023, categories: ['Film', 'Direction'], slug: 'fluidform', coverImage: null },
  { _id: '4', projectNumber: 4, title: 'Real Estate — Bondi Portfolio', client: 'Undisclosed', year: 2023, categories: ['Real Estate', 'Photography'], slug: 'bondi-portfolio', coverImage: null },
  { _id: '5', projectNumber: 5, title: 'Fashion Editorial', client: 'Tourist Fashion', year: 2023, categories: ['Fashion', 'Photography'], slug: 'fashion-editorial', coverImage: null },
  { _id: '6', projectNumber: 6, title: 'Restaurant — Bondi Beach', client: 'Undisclosed', year: 2022, categories: ['Photography', 'Film'], slug: 'restaurant-bondi', coverImage: null },
]

async function getProjects() {
  try { return await client.fetch(projectsQuery) } catch { return DEMO_PROJECTS }
}

export default async function WorkPage() {
  const projects = await getProjects()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Work</h1>
        <p className={styles.count}>
          <span className={styles.mono}>{projects.length}</span> projects
        </p>
      </header>

      <div className={styles.grid}>
        {projects.map((p: any) => (
          <Link key={p._id} href={`/work/${p.slug}`} className={styles.card}>
            <div className={styles.thumb}>
              {p.coverImage ? (
                <Image src={p.coverImage} alt={p.title} fill style={{ objectFit: 'cover' }} />
              ) : (
                <div className={styles.thumbPlaceholder}>
                  <span>{String(p.projectNumber).padStart(3, '0')}</span>
                </div>
              )}
            </div>
            <div className={styles.cardMeta}>
              <span className={styles.cardNum}>{String(p.projectNumber).padStart(3, '0')}</span>
              <div>
                <p className={styles.cardTitle}>{p.title}</p>
                <p className={styles.cardSub}>{p.client} — {p.year}</p>
              </div>
              <div className={styles.cardCats}>
                {(p.categories || []).map((c: string) => (
                  <span key={c} className={styles.cat}>{c}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
