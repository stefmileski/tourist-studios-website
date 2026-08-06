import type { Metadata } from 'next'
import { client, settingsQuery } from '@/lib/sanity'
import ContactForm from './ContactForm'

export const revalidate = 0
export const metadata: Metadata = { title: 'Contact' }

export default async function ContactPage() {
  const s = await client.fetch(settingsQuery).catch(() => null)

  return (
    <ContactForm
      email={s?.email            || 'hello@touriststudios.com.au'}
      location={s?.contactLocation  || 'Bondi, Sydney NSW'}
      availability={s?.contactAvailability || 'Nationally & internationally'}
      sub={s?.contactSub         || 'We read every enquiry. Usually back within 24 hours.'}
    />
  )
}
