'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { ShopifyProduct } from '@/lib/shopify'
import type { DiscogsListing } from '@/lib/discogs'
import DiscogsImage from '@/components/DiscogsImage'

const GENRES = ['All', 'Rock', 'Jazz', 'Soul & Blues', 'Hip-Hop', 'Classical', 'Country & Folk', 'Electronic', 'Pop', 'Metal & Punk', 'Rare & Collectible', 'CDs', 'Other']

function conditionColor(c: string): string {
  if (!c) return '#888'
  const u = c.toLowerCase()
  if (u.includes('mint') || u.startsWith('nm') || u.startsWith('m')) return '#16a34a'
  if (u.includes('vg+') || u.includes('vg ')) return '#C4522A'
  if (u.includes('vg')) return '#d97706'
  return '#888'
}

function matchGenreShopify(product: ShopifyProduct, genre: string) {
  if (genre === 'All') return true
  const haystack = [product.title, product.productType, ...product.tags].join(' ').toLowerCase()
  const map: Record<string, string[]> = {
    'Rock': ['rock', 'alternative', 'indie rock'],
    'Jazz': ['jazz'],
    'Soul & Blues': ['soul', 'blues', 'r&b', 'funk'],
    'Hip-Hop': ['hip-hop', 'hip hop', 'rap'],
    'Classical': ['classical', 'orchestra', 'symphony', 'opera'],
    'Country & Folk': ['country', 'folk', 'bluegrass', 'americana'],
    'Electronic': ['electronic', 'synth', 'techno', 'ambient', 'new wave'],
    'Pop': ['pop'],
    'Metal & Punk': ['metal', 'punk', 'hardcore', 'heavy'],
    'Rare & Collectible': ['rare', 'collectible', 'limited', 'pressing', 'first edition'],
    'CDs': ['cd', 'compact disc'],
    'Other': [],
  }
  return (map[genre] ?? []).some(t => haystack.includes(t))
}

function matchGenreDiscogs(listing: DiscogsListing, genre: string) {
  if (genre === 'All') return true
  const haystack = [
    ...(listing.release.genres ?? []),
    ...(listing.release.styles ?? []),
    listing.release.title,
    listing.release.format,
  ].join(' ').toLowerCase()
  const map: Record<string, string[]> = {
    'Rock': ['rock', 'alternative', 'indie rock', 'classic rock'],
    'Jazz': ['jazz'],
    'Soul & Blues': ['soul', 'blues', 'r&b', 'funk'],
    'Hip-Hop': ['hip hop', 'hip-hop', 'rap'],
    'Classical': ['classical', 'orchestra', 'symphony', 'opera'],
    'Country & Folk': ['country', 'folk', 'bluegrass', 'americana'],
    'Electronic': ['electronic', 'synth', 'techno', 'ambient', 'new wave', 'electro'],
    'Pop': ['pop'],
    'Metal & Punk': ['metal', 'punk', 'hardcore', 'heavy metal'],
    'Rare & Collectible': ['rare', 'collectible', 'limited', 'pressing'],
    'CDs': ['cd', 'compact disc'],
    'Other': [],
  }
  return (map[genre] ?? []).some(t => haystack.includes(t))
}

interface Props {
  products: ShopifyProduct[]
  discogsListings: DiscogsListing[]
  discogsTotal: number
  discogsPages: number
}

export default function ShopClient({ products, discogsListings, discogsTotal, discogsPages }: Props) {
  const [activeGenre, setActiveGenre] = useState('All')
  const [adding, setAdding] = useState<string | null>(null)
  const [allDiscogs, setAllDiscogs] = useState<DiscogsListing[]>(discogsListings)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  const filteredShopify = products.filter(p => matchGenreShopify(p, activeGenre))
  const filteredDiscogs = allDiscogs.filter(l => matchGenreDiscogs(l, activeGenre))
  const totalCount = filteredShopify.length + filteredDiscogs.length

  async function loadMore() {
    if (loadingMore || currentPage >= discogsPages) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/discogs-listings?page=${currentPage + 1}`)
      const data = await res.json()
      setAllDiscogs(prev => [...prev, ...(data.listings ?? [])])
      setCurrentPage(p => p + 1)
    } catch { /* silent */ } finally {
      setLoadingMore(false)
    }
  }

  async function handleBuy(product: ShopifyProduct) {
    const variantId = product.variants.edges[0]?.node?.id
    if (!variantId) return
    setAdding(product.id)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      })
      const data = await res.json()
      if (data.checkoutUrl) window.location.href = data.checkoutUrl
    } catch {
      alert('Something went wrong. Call us at 720-291-7000.')
    } finally {
      setAdding(null)
    }
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid rgba(26,16,8,0.1)',
    display: 'flex',
    flexDirection: 'column',
  }

  const imgWrap: React.CSSProperties = {
    position: 'relative',
    paddingBottom: '100%',
    backgroundColor: '#e8e0d0',
  }

  return (
    <div>
      {/* Genre filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {GENRES.map(g => (
          <button
            key={g}
            onClick={() => setActiveGenre(g)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              border: '1.5px solid',
              borderColor: activeGenre === g ? '#C4522A' : 'rgba(26,16,8,0.2)',
              backgroundColor: activeGenre === g ? '#C4522A' : 'transparent',
              color: activeGenre === g ? '#FAF7F0' : '#4a3828',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              letterSpacing: '0.03em',
              transition: 'all 0.15s',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Count */}
      {totalCount > 0 && (
        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.25rem' }}>
          Showing {totalCount.toLocaleString()} of {(discogsTotal + products.length).toLocaleString()} records available
          {allDiscogs.length > 0 && (
            <> · <span style={{ color: '#C4522A', fontWeight: 600 }}>Discogs listings</span> ship from the store</>
          )}
        </p>
      )}

      {totalCount === 0 ? (
        <p style={{ color: '#4a3828', padding: '2rem 0' }}>No records in that section right now. Check back or stop in — the in-store selection is much larger.</p>
      ) : (
        <div className="shop-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>

          {/* ── Shopify products ── */}
          {filteredShopify.map(product => {
            const image = product.images.edges[0]?.node
            const price = product.priceRange.minVariantPrice
            const variant = product.variants.edges[0]?.node
            const available = variant?.availableForSale ?? false
            const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currencyCode }).format(parseFloat(price.amount))

            return (
              <div key={product.id} style={cardStyle}>
                <div style={imgWrap}>
                  {image ? (
                    <Image src={image.url} alt={image.altText || product.title} fill sizes="(max-width: 640px) 50vw, 200px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '55%', aspectRatio: '1', borderRadius: '50%', backgroundColor: '#1a1008', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '28%', aspectRatio: '1', borderRadius: '50%', backgroundColor: '#4a3828' }} />
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1008', lineHeight: 1.3, margin: 0 }}>{product.title}</p>
                  {product.productType && <p style={{ fontSize: '0.7rem', color: '#C4522A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{product.productType}</p>}
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1008', marginTop: '0.2rem' }}>{formattedPrice}</p>
                </div>
                <div style={{ padding: '0 0.75rem 0.75rem' }}>
                  {available ? (
                    <button
                      onClick={() => handleBuy(product)}
                      disabled={adding === product.id}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: adding === product.id ? '#9a3f1e' : '#C4522A', color: '#FAF7F0', fontWeight: 700, fontSize: '0.8rem', border: 'none', borderRadius: '4px', cursor: adding === product.id ? 'wait' : 'pointer', letterSpacing: '0.04em' }}
                    >
                      {adding === product.id ? 'Going to checkout…' : 'Buy Now'}
                    </button>
                  ) : (
                    <p style={{ fontSize: '0.75rem', color: '#888', textAlign: 'center', margin: 0, fontStyle: 'italic' }}>Sold in store</p>
                  )}
                </div>
              </div>
            )
          })}

          {/* ── Discogs listings ── */}
          {filteredDiscogs.map(listing => {
            const price = listing.price?.value
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: listing.price.currency || 'USD' }).format(listing.price.value)
              : null
            const condition = listing.condition || ''
            const discogsUrl = `https://www.discogs.com/sell/item/${listing.id}`

            return (
              <div key={`discogs-${listing.id}`} style={cardStyle}>
                <div style={imgWrap}>
                  <DiscogsImage listingId={listing.id} title={listing.release.title} />
                  {/* Discogs badge */}
                  <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(26,16,8,0.75)', color: '#FAF7F0', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: '3px' }}>
                    DISCOGS
                  </div>
                </div>
                <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1008', lineHeight: 1.3, margin: 0 }}>
                    {listing.release.artist && <span style={{ fontWeight: 500, color: '#4a3828' }}>{listing.release.artist} — </span>}
                    {listing.release.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {listing.release.format && <p style={{ fontSize: '0.7rem', color: '#C4522A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{listing.release.format}</p>}
                    {listing.release.year > 0 && <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>{listing.release.year}</p>}
                  </div>
                  {condition && (
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: conditionColor(condition), margin: 0 }}>{condition}</p>
                  )}
                  {price && <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1008', marginTop: '0.2rem' }}>{price}</p>}
                </div>
                <div style={{ padding: '0 0.75rem 0.75rem' }}>
                  <a
                    href={discogsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', width: '100%', padding: '0.5rem', backgroundColor: '#1a1008', color: '#FAF7F0', fontWeight: 700, fontSize: '0.8rem', borderRadius: '4px', textAlign: 'center', letterSpacing: '0.04em', textDecoration: 'none', boxSizing: 'border-box' }}
                  >
                    Buy on Discogs
                  </a>
                </div>
              </div>
            )
          })}

        </div>
      )}

      {/* Load More */}
      {currentPage < discogsPages && (
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.75rem' }}>
            Showing {allDiscogs.length.toLocaleString()} of {discogsTotal.toLocaleString()} Discogs listings
          </p>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            style={{
              padding: '0.7rem 2.5rem',
              backgroundColor: 'transparent',
              border: '2px solid #1a1008',
              color: '#1a1008',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '4px',
              cursor: loadingMore ? 'wait' : 'pointer',
              letterSpacing: '0.04em',
              opacity: loadingMore ? 0.6 : 1,
              transition: 'all 0.15s',
            }}
          >
            {loadingMore ? 'Loading…' : `Load More (${(discogsTotal - allDiscogs.length).toLocaleString()} remaining)`}
          </button>
        </div>
      )}
    </div>
  )
}
