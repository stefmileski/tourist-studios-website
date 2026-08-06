import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { client, projectBySlugQuery } from '@/lib/sanity'
import styles from './page.module.css'

const DEMO: Record<string, any> = {
  'somos': {
    _id: '2', projectNumber: 87, title: 'The Creation of Somos',
    client: 'SOMOS', year: 2024, categories: ['Campaign', 'Direction'],
    description: 'A campaign film exploring identity, culture, and belonging for the SOMOS collective. Shot over two days across Sydney\'s inner west.',
    services: ['Direction', 'Cinematography', 'Editing', 'Colour Grade'],
    videoUrl: null, gallery: [], coverImage: null,
  }
}

async function getProject(slug: string) {
  try {
    const data = await client.fetch(projectBySlugQuery, { slug })
    return data || null
  } catch {
    return DEMO[slug] || null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getProject(slug)
  return { title: p?.title || 'Project' }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerMeta}>
          <span className={styles.projectNum}>{String(project.projectNumber).padStart(3, '0')}</span>
          <div className={styles.cats}>
            {(project.categories || []).map((c: string) => (
              <span key={c} className={styles.cat}>{c}</span>
            ))}
          </div>
        </div>
        <h1 className={styles.title}>{project.title}</h1>
        <div className={styles.headerDetails}>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Client</span>
            <span>{project.client}</span>
          </div>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Year</span>
            <span>{project.year}</span>
          </div>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Services</span>
            <span>{(project.services || []).join(', ')}</span>
          </div>
        </div>
      </header>

      {/* Hero image / video */}
      <div className={styles.hero}>
        {project.videoUrl ? (
          <div className={styles.videoWrap}>
            <iframe
              src={project.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className={styles.video}
            />
          </div>
        ) : project.coverImage ? (
          <div className={styles.heroImg}>
            <Image src={project.coverImage} alt={project.title} fill style={{ objectFit: 'cover' }} priority />
          </div>
        ) : (
          <div className={styles.heroPlaceholder}>
            <span>{String(project.projectNumber).padStart(3, '0')}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <section className={styles.body}>
          <p className={styles.description}>{project.description}</p>
        </section>
      )}

      {/* Gallery */}
      {project.gallery?.length > 0 && (
        <section className={styles.gallery}>
          {project.gallery.map((url: string, i: number) => (
            <div key={i} className={styles.galleryImg}>
              <Image src={url} alt={`${project.title} — ${i + 1}`} fill style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
