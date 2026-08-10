'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Wordmark from './Wordmark'
import styles from './Nav.module.css'

const links = [
  { href: '/work',    label: 'Work' },
  { href: '/about',   label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close the drawer on navigation
  useEffect(() => { setOpen(false) }, [pathname])

  // Escape closes; lock page scroll while open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} aria-label="Tourist Studios — Home">
          <Wordmark color="var(--crimson)" width={120} stacked={false} />
        </Link>
        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="nav-drawer"
        >
          <span />
          <span />
        </button>
      </nav>

      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="nav-drawer"
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        aria-hidden={!open}
      >
        <ul className={styles.drawerLinks}>
          {links.map(({ href, label }, i) => (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.drawerLink} ${pathname.startsWith(href) ? styles.active : ''}`}
                tabIndex={open ? 0 : -1}
              >
                <span className={styles.drawerNum}>{String(i + 1).padStart(2, '0')}</span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.drawerFooter}>
          <Link href="/contact" className={styles.drawerCta} tabIndex={open ? 0 : -1}>
            Start a project →
          </Link>
          <div className={styles.drawerMeta}>
            <a href="mailto:online@touriststudios.com.au" tabIndex={open ? 0 : -1}>
              online@touriststudios.com.au
            </a>
            <span>Bondi, Sydney NSW</span>
          </div>
        </div>
      </aside>
    </>
  )
}
