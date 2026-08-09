import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { client, projectBySlugQuery, projectsQuery } from '@/lib/sanity'
import styles from './page.module.css'

async function getProject(slug: string) {
  try {
    const data = await client.fetch(projectBySlugQuery, { slug })
    return data || null
  } catch {
    return null
  }
}

async function getProjectPosition(slug: string) {
  try {
    const allProjects = await client.fetch(projectsQuery)
    const index = allProjects.findIndex((p: any) => p.slug === slug)
    if (index === -1) return null
    const total = allProjects.length
    const digits = total.toString().length
    const formattedNumber = index.toString().padStart(digits, '0')
    return { position: formattedNumber, total }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getProject(slug)
  return { title: p?.title || 'Film' }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const positionData = await getProjectPosition(slug)

  // Extract video ID from URL for Vimeo player
  const getVimeoPlayerId = (url: string | null) => {
    if (!url) return null
    const match = url.match(/vimeo\.com\/(\d+)/)
    return match ? match[1] : null
  }

  const videoId = getVimeoPlayerId(project.videoUrl)

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <div className={styles.headerTop}>
            <div>
              <Link href="/work" className={styles.backLink}>← Back to Work</Link>
              {positionData && (
                <span className={styles.projectNumber}>{positionData.position} / {positionData.total}</span>
              )}
            </div>
            {project.categories && project.categories.length > 0 && (
              <span className={styles.categoryTag}>{project.categories[0]}</span>
            )}
          </div>
          <h1 className={styles.title}>{project.title}</h1>
          <div className={styles.headerDetails}>
            {project.client && (
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Client</span>
                <span>{project.client}</span>
              </div>
            )}
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Year</span>
              <span>{project.year}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Vimeo Player */}
      {videoId && (
        <div className={styles.videoSection}>
          <div className={styles.videoContainer}>
            <iframe
              src={`https://player.vimeo.com/video/${videoId}`}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className={styles.video}
            />
          </div>
        </div>
      )}

      {/* Description & Metadata */}
      {(project.description || project.gallery || project.services) && (
        <section className={styles.body}>
          {project.description && (
            <div className={styles.descriptionBlock}>
              <h2 className={styles.sectionTitle}>About</h2>
              <p className={styles.description}>{project.description}</p>
            </div>
          )}

          {project.services && project.services.length > 0 && (
            <div className={styles.servicesBlock}>
              <h3 className={styles.sectionTitle}>Services</h3>
              <ul className={styles.services}>
                {project.services.map((service: string, i: number) => (
                  <li key={i}>{service}</li>
                ))}
              </ul>
            </div>
          )}

          {project.gallery && project.gallery.length > 0 && (
            <div className={styles.galleryBlock}>
              <h3 className={styles.sectionTitle}>Gallery</h3>
              <div className={styles.gallery}>
                {project.gallery.map((imageUrl: string, i: number) => (
                  <div key={i} className={styles.galleryImage}>
                    <Image src={imageUrl} alt={`${project.title} - image ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Navigation */}
      <footer className={styles.footer}>
        <Link href="/work" className={styles.backButton}>← Back to Portfolio</Link>
      </footer>
    </div>
  )
}
