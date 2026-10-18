'use client'
import { useState, useEffect } from 'react'
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

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const delta = 2
  const rangeStart = Math.max(2, current - delta)
  const rangeEnd = Math.min(total - 1, current + delta)
  const range: number[] = []
  for (let i = rangeStart; i <= rangeEnd; i++) range.push(i)

  const pages: (number | '...')[] = [1]
  if (range[0] > 2) pages.push('...')
  pages.push(...range)
  if (range[range.length - 1] < total - 1) pages.push('...')
  pages.push(total)

  return pages
}

function pageBtnStyle(active: boolean, disabled: boolean): React.CSSProperties {
  return {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: active ? 'none' : '1.5px solid rgba(26,16,8,0.2)',
    backgroundColor: active ? '#C4522A' : 'transparent',
    color: active ? '#FAF7F0' : '#1a1008',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    transition: 'all 0.15s',
    padding: 0,
    flexShrink: 0,
  }
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
  const [fetchedPages, setFetchedPages] = useState(1)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [perPage, setPerPage] = useState(100)
  const [uiPage, setUiPage] = useState(1)

  // Reset to page 1 whenever genre or perPage changes
  useEffect(() => {
    setUiPage(1)
  }, [activeGenre, perPage])

  // Smart fetch: load more Discogs pages when the current UI page needs data we don't have yet
  useEffect(() => {
    let cancelled = false

    async function ensureData(targetPage: number, pp: number) {
      const needed = pp >= 9999 ? Infinity : targetPage * pp
      let page = fetchedPages
      let currentLength = allDiscogs.length

      if (currentLength >= needed || page >= discogsPages) return

      setFetchingMore(true)
      while (currentLength < needed && page < discogsPages) {
        if (cancelled) break
        page++
        try {
          const res = await fetch(`/api/discogs-listings?page=${page}`)
          const data = await res.json()
          const newListings: DiscogsListing[] = data.listings ?? []
          currentLength += newListings.length
          if (!cancelled) {
            setAllDiscogs(prev => [...prev, ...newListings])
            setFetchedPages(page)
          }
        } catch {
          break
        }
      }
      if (!cancelled) setFetchingMore(false)
    }

    ensureData(uiPage, perPage)
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiPage, perPage])

  const filteredShopify = products.filter(p => matchGenreShopify(p, activeGenre))
  const filteredDiscogs = allDiscogs.filter(l => matchGenreDiscogs(l, activeGenre))
  const allFiltered = [
    ...filteredShopify.map(p => ({ type: 'shopify' as const, data: p })),
    ...filteredDiscogs.map(l => ({ type: 'discogs' as const, data: l })),
  ]

  const effectivePerPage = perPage >= 9999 ? Math.max(allFiltered.length, 1) : perPage
  const totalUIPages = Math.max(1, Math.ceil(allFiltered.length / effectivePerPage))
  const start = (uiPage - 1) * effectivePerPage
  const pageItems = allFiltered.slice(start, start + effectivePerPage)

  const countX = allFiltered.length === 0 ? 0 : start + 1
  const countY = Math.min(start + effectivePerPage, allFiltered.length)
  const countZ = allFiltered.length

  const pageNums = getPageNumbers(uiPage, totalUIPages)

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
      {/* Genre filter pills + per-page selector */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {/* Genre pills — flex-wrap left */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
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
                whiteSpace: 'nowrap',
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Per-page selector — right-aligned */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <label
            htmlFor="per-page-select"
            style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a3828' }}
          >
            Per page:
          </label>
          <select
            id="per-page-select"
            value={perPage}
            onChange={e => setPerPage(Number(e.target.value))}
            style={{
              padding: '0.35rem 0.6rem',
              border: '1.5px solid rgba(26,16,8,0.3)',
              borderRadius: '6px',
              backgroundColor: '#FAF7F0',
              color: '#1a1008',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              outline: 'none',
              accentColor: '#C4522A',
            }}
          >
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={300}>300</option>
            <option value={9999}>All</option>
          </select>
        </div>
      </div>

      {/* Count line */}
      {allFiltered.length > 0 && (
        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.25rem' }}>
          Showing {countX}–{countY} of {countZ.toLocaleString()} filtered results
          {allDiscogs.length > 0 && (
            <> · <span style={{ color: '#C4522A', fontWeight: 600 }}>Discogs listings</span> ship from the store</>
          )}
        </p>
      )}

      {allFiltered.length === 0 ? (
        <p style={{ color: '#4a3828', padding: '2rem 0' }}>No records in that section right now. Check back or stop in — the in-store selection is much larger.</p>
      ) : (
        <div
          className="shop-product-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}
        >
          {pageItems.map(item => {
            /* ── Shopify product card ── */
            if (item.type === 'shopify') {
              const product = item.data as ShopifyProduct
              const image = product.images.edges[0]?.node
              const price = product.priceRange.minVariantPrice
              const variant = product.variants.edges[0]?.node
              const available = variant?.availableForSale ?? false
              const formattedPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: price.currencyCode,
              }).format(parseFloat(price.amount))

              return (
                <div key={product.id} style={cardStyle}>
                  <div style={imgWrap}>
                    {image ? (
                      <Image
                        src={image.url}
                        alt={image.altText || product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 200px"
                        style={{ objectFit: 'cover' }}
                      />
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
                    {product.productType && (
                      <p style={{ fontSize: '0.7rem', color: '#C4522A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                        {product.productType}
                      </p>
                    )}
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1008', marginTop: '0.2rem' }}>{formattedPrice}</p>
                  </div>
                  <div style={{ padding: '0 0.75rem 0.75rem' }}>
                    {available ? (
                      <button
                        onClick={() => handleBuy(product)}
                        disabled={adding === product.id}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: adding === product.id ? '#9a3f1e' : '#C4522A',
                          color: '#FAF7F0',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: adding === product.id ? 'wait' : 'pointer',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {adding === product.id ? 'Going to checkout…' : 'Buy Now'}
                      </button>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: '#888', textAlign: 'center', margin: 0, fontStyle: 'italic' }}>Sold in store</p>
                    )}
                  </div>
                </div>
              )
            }

            /* ── Discogs listing card ── */
            const listing = item.data as DiscogsListing
            const price = listing.price?.value
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: listing.price.currency || 'USD' }).format(listing.price.value)
              : null
            const condition = listing.condition || ''
            const discogsUrl = `https://www.discogs.com/sell/item/${listing.id}`

            return (
              <div key={`discogs-${listing.id}`} style={cardStyle}>
                <div style={imgWrap}>
                  <DiscogsImage listingId={listing.id} title={listing.release.title} />
                  <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(26,16,8,0.75)', color: '#FAF7F0', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: '3px' }}>
                    DISCOGS
                  </div>
                </div>
                <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1008', lineHeight: 1.3, margin: 0 }}>
                    {listing.release.artist && (
                      <span style={{ fontWeight: 500, color: '#4a3828' }}>{listing.release.artist} — </span>
                    )}
                    {listing.release.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {listing.release.format && (
                      <p style={{ fontSize: '0.7rem', color: '#C4522A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                        {listing.release.format}
                      </p>
                    )}
                    {listing.release.year > 0 && (
                      <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>{listing.release.year}</p>
                    )}
                  </div>
                  {condition && (
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: conditionColor(condition), margin: 0 }}>{condition}</p>
                  )}
                  {price && (
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1008', marginTop: '0.2rem' }}>{price}</p>
                  )}
                </div>
                <div style={{ padding: '0 0.75rem 0.75rem' }}>
                  <a
                    href={discogsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#1a1008',
                      color: '#FAF7F0',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      textAlign: 'center',
                      letterSpacing: '0.04em',
                      textDecoration: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    Buy on Discogs
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalUIPages > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '2.5rem' }}>
          {fetchingMore && (
            <p style={{ fontSize: '0.8rem', color: '#C4522A', fontWeight: 600, margin: 0 }}>Loading…</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Left arrow */}
            <button
              onClick={() => setUiPage(p => Math.max(1, p - 1))}
              disabled={uiPage === 1}
              style={pageBtnStyle(false, uiPage === 1)}
              aria-label="Previous page"
            >
              ←
            </button>

            {pageNums.map((p, i) =>
              p === '...' ? (
                <span
                  key={`ellipsis-${i}`}
                  style={{ padding: '0.4rem 0.25rem', color: '#888', fontSize: '0.85rem', userSelect: 'none' }}
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setUiPage(p as number)}
                  style={pageBtnStyle(p === uiPage, false)}
                  aria-label={`Page ${p}`}
                  aria-current={p === uiPage ? 'page' : undefined}
                >
                  {p}
                </button>
              )
            )}

            {/* Right arrow */}
            <button
              onClick={() => setUiPage(p => Math.min(totalUIPages, p + 1))}
              disabled={uiPage === totalUIPages}
              style={pageBtnStyle(false, uiPage === totalUIPages)}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
