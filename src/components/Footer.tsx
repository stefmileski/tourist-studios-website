import Link from 'next/link'
import styles from './Footer.module.css'

interface FooterProps {
  settings: {
    email?: string
    instagram?: string
    vimeo?: string
    contactLocation?: string
  } | null
}

export default function Footer({ settings }: FooterProps) {
  const year     = new Date().getFullYear()
  const email    = settings?.email        || 'online@touriststudios.com.au'
  const instagram = settings?.instagram  || 'https://instagram.com/touriststudios'
  const vimeo    = settings?.vimeo        || 'https://vimeo.com/touriststudios'
  const location = settings?.contactLocation || 'Bondi, Sydney NSW'

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.col}>
          <span className={styles.label}>Location</span>
          <span>{location}</span>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>Enquiries</span>
          <a href={`mailto:${email}`}>{email}</a>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>Follow</span>
          <a href={instagram} target="_blank" rel="noopener">Instagram</a>
          <a href={vimeo}     target="_blank" rel="noopener">Vimeo</a>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>Navigate</span>
          <Link href="/work">Work</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
      <div className={styles.bottom}>
        <span className={styles.copy}>© {year} Tourist Studios Pty Ltd</span>
        <span className={styles.abn}>ABN — registered Sydney, Australia</span>
      </div>
    </footer>
  )
}
