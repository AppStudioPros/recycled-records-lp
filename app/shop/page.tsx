import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import type { RRListing } from '@/lib/types/rr-inventory'
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

async function getShopData(): Promise<{
  listings: RRListing[]
  total: number
  genres: string[]
  formats: string[]
}> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://recycledrecordslps.com'

  try {
    const [listingsRes, metaRes] = await Promise.all([
      fetch(`${baseUrl}/api/shop/listings?per_page=50&page=1`, {
        next: { revalidate: 60 },
      }),
      fetch(`${baseUrl}/api/shop/listings/meta`, {
        next: { revalidate: 300 },
      }),
    ])

    const listingsData = listingsRes.ok ? await listingsRes.json() : {}
    const metaData = metaRes.ok ? await metaRes.json() : {}

    const listings: RRListing[] = listingsData.listings ?? []
    const total: number = listingsData.total ?? 0
    const genres: string[] = metaData.genres ?? []
    const formats: string[] = metaData.formats ?? []

    // If Supabase has data, use it
    if (listings.length > 0) {
      return { listings, total, genres, formats }
    }

    // Fallback: fetch first 50 from Discogs directly (initial sync not done yet)
    const discogsRes = await fetch(
      'https://api.discogs.com/users/RecycledRecordsLp/inventory?status=For+Sale&per_page=50&sort=listed&sort_order=desc',
      {
        headers: {
          'User-Agent': 'RecycledRecordsLP/1.0 +https://recycledrecordslps.com',
          Authorization: `Discogs key=${process.env.DISCOGS_CONSUMER_KEY}, secret=${process.env.DISCOGS_CONSUMER_SECRET}`,
        },
        next: { revalidate: 300 },
      }
    )

    if (!discogsRes.ok) return { listings: [], total: 0, genres: [], formats: [] }
    const discogsData = await discogsRes.json()

    // Map Discogs listings to RRListing shape
    const fallbackListings: RRListing[] = (discogsData.listings ?? []).map((l: any) => ({
      listing_id: l.id,
      release_id: l.release.id,
      title: l.release.title ?? null,
      artist: l.release.artist ?? null,
      format: l.release.format ?? null,
      genres: l.release.genres ?? [],
      styles: l.release.styles ?? [],
      condition: l.condition ?? null,
      sleeve_condition: l.sleeve_condition ?? null,
      price: l.price?.value != null ? parseFloat(String(l.price.value)) : null,
      currency: l.price?.currency ?? 'USD',
      listing_url: l.uri ?? null,
      year: l.release.year ?? null,
      label: l.release.label ?? null,
      country: l.release.country ?? null,
      notes: l.comments ?? null,
      status: 'For Sale',
      last_synced: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }))

    const fallbackTotal = discogsData.pagination?.items ?? fallbackListings.length

    return { listings: fallbackListings, total: fallbackTotal, genres: [], formats: [] }
  } catch {
    return { listings: [], total: 0, genres: [], formats: [] }
  }
}

export default async function ShopPage() {
  const { listings, total, genres, formats } = await getShopData()

  const isEmpty = listings.length === 0 && total === 0

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
        {isEmpty ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.5rem', color: '#1a1008', marginBottom: '0.75rem' }}>The online shop is getting stocked.</p>
            <p style={{ color: '#4a3828', marginBottom: '1.5rem' }}>The real digging is happening in Boulder. Stop in or give us a call.</p>
            <a href="tel:+17202917000" style={{ display: 'inline-block', padding: '0.7rem 1.75rem', backgroundColor: '#C4522A', color: '#FAF7F0', fontWeight: 700, borderRadius: '4px', textDecoration: 'none' }}>Call the shop</a>
          </div>
        ) : (
          <ShopClient
            initialListings={listings}
            total={total}
            genres={genres}
            formats={formats}
          />
        )}
      </div>

      {/* Footer strip */}
      <div style={{ borderTop: '1px solid rgba(26,16,8,0.15)', padding: '1.5rem', textAlign: 'center', color: '#4a3828', fontSize: '0.85rem' }}>
        In-store inventory is larger. <Link href="/#visit" style={{ color: '#C4522A', fontWeight: 600 }}>Visit us in Boulder →</Link>
      </div>
    </div>
  )
}
