import Link from 'next/link'
import { client, projectsQuery, settingsQuery } from '@/lib/sanity'
import styles from './page.module.css'

export const revalidate = 0

// Fallback data for development / before Sanity is connected
const DEMO_PROJECTS = [
  { _id: '1', projectNumber: '001', title: 'Young Academics — Brand Film', client: 'Young Academics', year: 2024, categories: ['Film', 'Photography'], slug: 'young-academics', featured: true },
  { _id: '2', projectNumber: '002', title: 'SOMOS — Campaign', client: 'SOMOS', year: 2024, categories: ['Campaign', 'Direction'], slug: 'somos', featured: true },
  { _id: '3', projectNumber: '003', title: 'Fluidform — Studio Series', client: 'Fluidform Pilates', year: 2023, categories: ['Film', 'Direction'], slug: 'fluidform', featured: false },
  { _id: '4', projectNumber: '004', title: 'Real Estate — Bondi Portfolio', client: 'Undisclosed', year: 2023, categories: ['Real Estate', 'Photography'], slug: 'bondi-portfolio', featured: false },
  { _id: '5', projectNumber: '005', title: 'Fashion Editorial', client: 'Tourist Fashion', year: 2023, categories: ['Fashion', 'Photography'], slug: 'fashion-editorial', featured: false },
]

const DEFAULTS = {
  heroHeadline: 'We make things\nworth watching.',
  heroSub: 'Tourist Studios is a boutique production company.\nFilm, photography, and creative direction — Bondi to everywhere.',
  services: ['Commercial Film', 'Brand Photography', 'Real Estate Video', 'Creative Direction', 'Post Production'],
}

async function getProjects() {
  try {
    return await client.fetch(projectsQuery)
  } catch {
    return DEMO_PROJECTS
  }
}

async function getSettings() {
  try {
    return await client.fetch(settingsQuery)
  } catch {
    return null
  }
}

export default async function HomePage() {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()])

  const headline = settings?.heroHeadline || DEFAULTS.heroHeadline
  const heroSub  = settings?.heroSub      || DEFAULTS.heroSub
  const services = settings?.services?.length ? settings.services : DEFAULTS.services

  // Split headline on newline so <br /> is controlled by CMS content, not hardcoded
  const headlineParts = headline.split('\n')

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroMeta}>
          <span className={styles.heroTag}>Est. Sydney, Australia</span>
          <span className={styles.heroTag}>Production · Direction · Photography</span>
        </div>
        <h1 className={styles.heroHeadline}>
          {headlineParts.map((line: string, i: number) => (
            <span key={i}>{line}{i < headlineParts.length - 1 && <br />}</span>
          ))}
        </h1>
        <p className={styles.heroSub}>
          {heroSub.split('\n').map((line: string, i: number) => (
            <span key={i}>{line}{i < heroSub.split('\n').length - 1 && <br />}</span>
          ))}
        </p>
      </section>

      {/* Work Index — Ledger */}
      <section className={styles.ledger}>
        <div className={styles.ledgerHeader}>
          <span className={styles.ledgerCol}>No.</span>
          <span className={styles.ledgerCol}>Project</span>
          <span className={styles.ledgerCol}>Client</span>
          <span className={styles.ledgerCol}>Category</span>
          <span className={styles.ledgerColRight}>Year</span>
        </div>
        <div className={styles.ledgerBody}>
          {projects.map((p: any) => (
            <Link key={p._id} href={`/work/${p.slug}`} className={styles.ledgerRow}>
              <span className={styles.ledgerNum}>
                {String(p.projectNumber).padStart(3, '0')}
              </span>
              <span className={styles.ledgerTitle}>
                {p.title}
                <span className={styles.ledgerArrow}>→</span>
              </span>
              <span className={styles.ledgerClient}>{p.client}</span>
              <span className={styles.ledgerCats}>
                {(p.categories || []).map((c: string) => (
                  <span key={c} className={styles.cat}>{c}</span>
                ))}
              </span>
              <span className={styles.ledgerYear}>{p.year}</span>
            </Link>
          ))}
        </div>
        <div className={styles.ledgerFooter}>
          <Link href="/work" className={styles.viewAll}>
            View full archive ({projects.length} projects) →
          </Link>
        </div>
      </section>

      {/* Services strip */}
      <section className={styles.services}>
        {services.map((s: string) => (
          <span key={s} className={styles.serviceItem}>{s}</span>
        ))}
      </section>
    </div>
  )
}
