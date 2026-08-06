'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface ContactFormProps {
  email:        string
  location:     string
  availability: string
  sub:          string
}

export default function ContactForm({ email, location, availability, sub }: ContactFormProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({ name: '', email: '', company: '', budget: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('https://formspree.io/f/xnjrvyla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setStatus('sent')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Start a project</h1>
        <p className={styles.sub}>{sub}</p>
      </header>

      <div className={styles.body}>
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <a href={`mailto:${email}`}>{email}</a>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Based</span>
            <span>{location}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Available</span>
            <span>{availability}</span>
          </div>
        </div>

        {status === 'sent' ? (
          <div className={styles.success}>
            <p className={styles.successMsg}>Got it. We'll be in touch shortly.</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">Name *</label>
                <input id="name" required className={styles.input} value={form.name} onChange={set('name')} placeholder="Your name" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email *</label>
                <input id="email" type="email" required className={styles.input} value={form.email} onChange={set('email')} placeholder="you@example.com" />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="company">Company / Brand</label>
                <input id="company" className={styles.input} value={form.company} onChange={set('company')} placeholder="Optional" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="budget">Budget range</label>
                <select id="budget" className={styles.input} value={form.budget} onChange={set('budget')}>
                  <option value="">Select...</option>
                  <option>Under $2,000</option>
                  <option>$2,000 – $5,000</option>
                  <option>$5,000 – $10,000</option>
                  <option>$10,000 – $25,000</option>
                  <option>$25,000+</option>
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="message">Tell us about the project *</label>
              <textarea id="message" required className={`${styles.input} ${styles.textarea}`} value={form.message} onChange={set('message')} placeholder="What are you making? When? What are you trying to say?" rows={6} />
            </div>
            <button type="submit" className={styles.submit} disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending...' : 'Send enquiry →'}
            </button>
            {status === 'error' && (
              <p className={styles.error}>
                Something went wrong. Email us directly: <a href={`mailto:${email}`}>{email}</a>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
