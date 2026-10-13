import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import { getProducts, type ShopifyProduct } from '@/lib/shopify'
import { getDiscogsInventory, type DiscogsListing } from '@/lib/discogs'
import ShopClient from './ShopClient'

export const metadata: Metadata = {
  title: 'Shop Records Online | Recycled Records LP — Boulder, CO',
  description: 'Browse and buy vinyl records, CDs, cassettes, and vintage audio online from Recycled Records LP in Boulder, CO. 100,000+ records in stock. Every record ultrasonically cleaned.',
  openGraph: {
    title: 'Shop Records Online — Recycled Records LP',
    description: 'Browse vinyl records, CDs, cassettes, and vintage audio from Boulder\'s biggest used record store. Every record ultrasonically cleaned. Ships from Boulder, CO.',
    url: 'https://recycledrecordslps.com/shop',
    siteName: 'Recycled Records LP',
    locale: 'en_US',
    type: 'website',
  },
}

export const revalidate = 60

export default async function ShopPage() {
  let products: ShopifyProduct[] = []
  let discogsListings: DiscogsListing[] = []
  let discogsTotal = 0
  let discogsPages = 1
  let error = false
  try {
    ;[products, { listings: discogsListings, total: discogsTotal, pages: discogsPages }] = await Promise.all([
      getProducts(48).catch(() => []),
      getDiscogsInventory('RecycledRecordsLp', 100),
    ])
  } catch {
    error = true
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0' }}>
      <Header />

      {/* Page header */}
      <div style={{ borderBottom: '2px solid #1a1008', padding: '2.5rem 1.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4522A', fontWeight: 700, marginBottom: '0.5rem' }}>Online Shop</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, color: '#1a1008', marginBottom: '0.75rem' }}>
          Online Shop
        </h1>
        <p style={{ color: '#4a3828', fontSize: '1rem', maxWidth: '560px', lineHeight: 1.65 }}>
          Every record in our online shop has been ultrasonically cleaned, graded, and packaged with care. These are real records from a real store in Boulder.
        </p>
      </div>

      {/* Products */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        {error ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#4a3828' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Couldn't load the shop right now. Give us a call and we can help you find what you're looking for.</p>
            <a href="tel:+17202917000" style={{ color: '#C4522A', fontWeight: 700, fontSize: '1.1rem' }}>720-291-7000</a>
          </div>
        ) : products.length === 0 && discogsListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.5rem', color: '#1a1008', marginBottom: '0.75rem' }}>The online shop is getting stocked.</p>
            <p style={{ color: '#4a3828', marginBottom: '1.5rem' }}>The real digging is happening in Boulder. Stop in or give us a call.</p>
            <a href="tel:+17202917000" style={{ display: 'inline-block', padding: '0.7rem 1.75rem', backgroundColor: '#C4522A', color: '#FAF7F0', fontWeight: 700, borderRadius: '4px', textDecoration: 'none' }}>Call the shop</a>
          </div>
        ) : (
          <ShopClient products={products} discogsListings={discogsListings} discogsTotal={discogsTotal} discogsPages={discogsPages} />
        )}
      </div>

      {/* Footer strip */}
      <div style={{ borderTop: '1px solid rgba(26,16,8,0.15)', padding: '1.5rem', textAlign: 'center', color: '#4a3828', fontSize: '0.85rem' }}>
        In-store inventory is larger. <Link href="/#visit" style={{ color: '#C4522A', fontWeight: 600 }}>Visit us in Boulder →</Link>
      </div>
    </div>
  )
}
