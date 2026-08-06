import type { Metadata } from 'next'
import { client, settingsQuery } from '@/lib/sanity'
import styles from './page.module.css'

export const revalidate = 0
export const metadata: Metadata = { title: 'About' }

const DEFAULTS = {
  aboutLead:      'Tourist Studios is a boutique production company based in Bondi, Sydney. We make films, photographs, and campaigns for brands that care about how they look.',
  aboutHowWeWork: "We run lean — one director, one vision, zero committees. Every project is taken on because we believe in the brief, not to fill a roster. Sydney-based, available anywhere.",
  aboutClients:   "We work with fashion labels, hospitality groups, wellness brands, real estate agencies, and early-stage companies who need to look like they've been around forever.",
  services:       ['Commercial Film & TVC', 'Brand Photography', 'Real Estate Video', 'Creative Direction', 'Post Production', 'Social Content'],
}

export default async function AboutPage() {
  const s = await client.fetch(settingsQuery).catch(() => null)

  const lead       = s?.aboutLead      || DEFAULTS.aboutLead
  const howWeWork  = s?.aboutHowWeWork || DEFAULTS.aboutHowWeWork
  const clients    = s?.aboutClients   || DEFAULTS.aboutClients
  const services   = s?.services?.length ? s.services : DEFAULTS.services

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>About</h1>
      </header>

      <div className={styles.body}>
        <div className={styles.intro}>
          <p className={styles.lead}>{lead}</p>
        </div>

        <div className={styles.cols}>
          <div className={styles.col}>
            <h2 className={styles.colHead}>What we do</h2>
            <ul className={styles.list}>
              {services.map((svc: string) => <li key={svc}>{svc}</li>)}
            </ul>
          </div>

          <div className={styles.col}>
            <h2 className={styles.colHead}>How we work</h2>
            <p>{howWeWork}</p>
          </div>

          <div className={styles.col}>
            <h2 className={styles.colHead}>Clients</h2>
            <p className={styles.clientNote}>{clients}</p>
          </div>
        </div>

        <div className={styles.cta}>
          <a href="/contact" className={styles.ctaLink}>
            Start a conversation →
          </a>
        </div>
      </div>
    </div>
  )
}
