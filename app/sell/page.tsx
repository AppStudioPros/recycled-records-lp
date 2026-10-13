import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import SellForm from './SellForm'

export const metadata: Metadata = {
  title: 'Sell Your Records | Recycled Records LP — Boulder, CO',
  description: 'Sell your vinyl records, CDs, cassettes, and vintage audio to Recycled Records LP in Boulder, CO. We buy collections of all sizes — no appointment needed. Tell us what you have.',
  openGraph: {
    title: 'Sell Your Records — Recycled Records LP',
    description: 'We buy vinyl records, CDs, cassettes, and vintage audio. Collections of all sizes. No appointment needed. Boulder, CO.',
    url: 'https://recycledrecordslps.com/sell',
    siteName: 'Recycled Records LP',
    locale: 'en_US',
    type: 'website',
  },
}

export default function SellPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0' }}>
      <Header />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        {/* Page header */}
        <div style={{ marginBottom: '2.5rem', borderBottom: '2px solid #1a1008', paddingBottom: '2rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4522A', fontWeight: 700, marginBottom: '0.5rem' }}>
            Sell Your Collection
          </p>
          <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1, color: '#1a1008', marginBottom: '1rem' }}>
            Your old records.<br />Someone's new favorites.
          </h1>
          <p style={{ color: '#4a3828', lineHeight: 1.75, fontSize: '1rem', maxWidth: '560px' }}>
            We buy vinyl records, CDs, cassettes, and vintage audio equipment. Collections large and small — estate sales, downsizing, or just making room for new finds.
          </p>
        </div>

        {/* What we buy */}
        <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,16,8,0.1)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.1rem', color: '#1a1008', marginBottom: '1rem' }}>What we buy</h2>
          <div className="whatwebuy-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' }}>
            {[
              'Vinyl records (all genres)',
              'CDs and box sets',
              'Cassette tapes',
              'Vintage audio equipment',
              'Turntables and receivers',
              'Rare and collectible pressings',
              'Large collections and estates',
              'Movie posters and memorabilia',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#4a3828' }}>
                <span style={{ color: '#C4522A', fontWeight: 700 }}>✓</span> {item}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '1.25rem', borderTop: '1px solid rgba(26,16,8,0.08)', paddingTop: '1rem' }}>
            Not sure if we'll take it? Describe what you have below and we'll let you know. You can also call us at <a href="tel:+17202917000" style={{ color: '#C4522A', fontWeight: 600 }}>720-291-7000</a>.
          </p>
        </div>

        {/* Form */}
        <SellForm />
      </div>

      {/* Footer strip */}
      <div style={{ borderTop: '1px solid rgba(26,16,8,0.15)', padding: '1.5rem', textAlign: 'center', color: '#4a3828', fontSize: '0.85rem' }}>
        Prefer to bring them in? <Link href="/#visit" style={{ color: '#C4522A', fontWeight: 600 }}>Find us in Boulder →</Link>
      </div>
    </div>
  )
}
