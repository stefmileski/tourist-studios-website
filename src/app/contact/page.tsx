import type { Metadata } from 'next'
import { client, settingsQuery } from '@/lib/sanity'
import Preloader from '@/components/Preloader'
import ContactForm from './ContactForm'

export const revalidate = 60
export const metadata: Metadata = { title: 'Contact' }

export default async function ContactPage() {
  const s = await client.fetch(settingsQuery).catch(() => null)

  return (
    <>
      <Preloader maxMs={2000} />
      <ContactForm
      email={s?.email            || 'online@touriststudios.com.au'}
      location={s?.contactLocation  || 'Bondi, Sydney NSW'}
      availability={s?.contactAvailability || 'Nationally & internationally'}
      sub={s?.contactSub         || 'We read every enquiry. Usually back within 24 hours.'}
      />
    </>
  )
}
