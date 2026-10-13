import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import { cities, getCityBySlug } from '@/lib/cities'
import { store } from '@/lib/store'

export async function generateStaticParams() {
  return cities.map(c => ({ city: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params
  const page = getCityBySlug(slug)
  if (!page) return {}
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `https://recycledrecordslps.com/${slug}`,
      siteName: 'Recycled Records LP',
      locale: 'en_US',
      type: 'website',
    },
  }
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params
  const page = getCityBySlug(slug)
  if (!page) notFound()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicStore',
    name: 'Recycled Records LP',
    url: `https://recycledrecordslps.com/${slug}`,
    telephone: '+17202917000',
    description: page.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address,
      addressLocality: 'Boulder',
      addressRegion: 'CO',
      postalCode: '80301',
      addressCountry: 'US',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 40.0634, longitude: -105.2078 },
    areaServed: page.city,
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday','Wednesday','Thursday','Friday'], opens: '11:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '12:00', closes: '17:00' },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://recycledrecordslps.com' },
      { '@type': 'ListItem', position: 2, name: `Record Store ${page.city}, CO`, item: `https://recycledrecordslps.com/${slug}` },
    ],
  }

  return (
    <>
      <Header />
      {/* Breadcrumb */}
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(26,16,8,0.1)', fontSize: '0.8rem', color: '#888' }}>
        <Link href="/" style={{ color: '#888' }}>Home</Link> / Record Store {page.city}, CO
      </div>

      <main style={{ backgroundColor: '#FAF7F0', minHeight: '100vh' }}>

        {/* Hero */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '420px' }} className="about-grid">
          <div style={{ padding: 'clamp(2rem,6vw,4rem)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4522A', marginBottom: '1rem' }}>{page.city}, Colorado</p>
            <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(2rem,4vw,3.25rem)', lineHeight: 1.05, letterSpacing: '-0.04em', color: '#1a1008', marginBottom: '1rem' }}>{page.headline}</h1>
            <p style={{ fontSize: '1.05rem', color: '#4a3828', lineHeight: 1.65, marginBottom: '1.75rem', maxWidth: '480px' }}>{page.subheadline}</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#C4522A', color: '#FAF7F0', fontWeight: 700, padding: '0.75rem 1.75rem', borderRadius: '4px', fontSize: '0.95rem' }}>Get Directions</a>
              <a href="/sell" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(26,16,8,0.3)', color: '#1a1008', fontWeight: 600, padding: '0.75rem 1.5rem', borderRadius: '4px', fontSize: '0.95rem' }}>Sell Your Records</a>
            </div>
          </div>
          <div style={{ position: 'relative', minHeight: '340px', backgroundColor: '#2a1a0a' }}>
            <Image src="/images/store/gallery-rock-bins.jpg" alt={`Vinyl record bins at Recycled Records LP near ${page.city}, CO`} fill sizes="50vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>

        {/* About */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#1a1008', marginBottom: '2rem' }}>{page.description}</p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
            {[['100,000+', 'Vinyl Records'], ['20,000+', 'Used CDs'], ['Est. 2010', 'Serving Colorado']].map(([num, label]) => (
              <div key={label} style={{ backgroundColor: '#fff', border: '1px solid rgba(26,16,8,0.1)', borderRadius: '6px', padding: '1.25rem', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.6rem', color: '#C4522A', fontWeight: 800, margin: '0 0 0.25rem' }}>{num}</p>
                <p style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Hours + Address */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }} className="about-grid">
            <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,16,8,0.1)', borderRadius: '6px', padding: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.1rem', color: '#1a1008', marginBottom: '1rem' }}>Hours</h2>
              {store.hours.map(([day, time]) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(26,16,8,0.07)', fontSize: '0.9rem' }}>
                  <span>{day}</span><span style={{ fontWeight: 600 }}>{time}</span>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: '#1a1008', color: '#F2EBDD', borderRadius: '6px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Visit Us</h2>
                <address style={{ fontStyle: 'normal', lineHeight: 1.7, opacity: 0.85, fontSize: '0.95rem' }}>
                  {store.address}<br />{store.locality}
                </address>
              </div>
              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#C4522A', fontSize: '0.875rem', textDecoration: 'underline' }}>Open in Maps →</a>
                <a href={store.phoneHref} style={{ color: '#F2EBDD', fontSize: '0.875rem', opacity: 0.75 }}>{store.phone}</a>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.5rem', color: '#1a1008', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
            {page.faqs.map(f => (
              <div key={f.q} style={{ backgroundColor: '#fff', border: '1px solid rgba(26,16,8,0.1)', borderRadius: '6px', padding: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#1a1008', marginBottom: '0.4rem' }}>{f.q}</p>
                <p style={{ color: '#4a3828', lineHeight: 1.65, fontSize: '0.95rem' }}>{f.a}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ backgroundColor: '#C4522A', borderRadius: '6px', padding: '2rem', textAlign: 'center', color: '#FAF7F0' }}>
            <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Ready to dig?</p>
            <p style={{ opacity: 0.85, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Come in anytime — no appointment needed.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#FAF7F0', color: '#C4522A', fontWeight: 700, padding: '0.7rem 1.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>Get Directions</a>
              <a href={store.phoneHref} style={{ border: '1.5px solid rgba(242,247,240,0.5)', color: '#FAF7F0', fontWeight: 600, padding: '0.7rem 1.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>{store.phone}</a>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(26,16,8,0.15)', padding: '1.5rem', textAlign: 'center', color: '#888', fontSize: '0.8rem', backgroundColor: '#FAF7F0' }}>
        <Link href="/" style={{ color: '#1a1008', fontWeight: 600 }}>← Back to Recycled Records LP</Link>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }} />
    </>
  )
}
