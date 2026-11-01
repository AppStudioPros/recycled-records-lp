import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Recycled Records LP — Boulder, CO',
  description: 'Get in touch with Recycled Records LP in Boulder, CO. Questions about records, equipment, buying or selling? Drop us a note or give us a call.',
  openGraph: {
    title: 'Contact — Recycled Records LP',
    description: 'Drop the needle. Swing by. Questions about records, equipment, buying or selling? We\'re here Tuesday through Sunday in Boulder, CO.',
    url: 'https://recycledrecordslps.com/contact',
    siteName: 'Recycled Records LP',
    images: [{ url: 'https://recycledrecordslps.com/images/store/contact-hero.png', width: 2400, height: 1350, alt: 'Drop the Needle. Swing By. — Recycled Records LP' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact — Recycled Records LP',
    description: 'Drop the needle. Swing by. We\'re here Tuesday through Sunday in Boulder, CO.',
    images: ['https://recycledrecordslps.com/images/store/contact-hero.png'],
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
