'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import type { RRListing } from '@/lib/types/rr-inventory'
import type { ShopifyProduct } from '@/lib/shopify'
import DiscogsImage from '@/components/DiscogsImage'
import CartDrawer from '@/components/CartDrawer'
import { useCart } from '@/contexts/CartContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

function conditionColor(c: string): string {
  if (!c) return '#888'
  const u = c.toLowerCase()
  if (u.includes('mint') || u.startsWith('nm') || u.startsWith('m')) return '#16a34a'
  if (u.includes('vg+') || u.includes('vg ')) return '#C4522A'
  if (u.includes('vg')) return '#d97706'
  return '#888'
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

const selectStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  border: '1.5px solid rgba(26,16,8,0.25)',
  borderRadius: '6px',
  backgroundColor: '#FAF7F0',
  color: '#1a1008',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
  outline: 'none',
  minWidth: '130px',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%231a1008' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: '2rem',
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  initialListings: RRListing[]
  total: number
  genres: string[]
  formats: string[]
  shopifyProducts?: ShopifyProduct[]
}

export default function ShopClient({ initialListings, total, genres, formats, shopifyProducts = [] }: Props) {
  const { itemCount, addItem } = useCart()
  const [shopTab, setShopTab] = useState<'discogs' | 'shopify'>('discogs')
  const [cartOpen, setCartOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('All')
  const [format, setFormat] = useState('All')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  const [listings, setListings] = useState<RRListing[]>(initialListings)
  const [totalCount, setTotalCount] = useState(total)
  const [loading, setLoading] = useState(false)

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSearch = useRef(search)

  // ── Fetch from API ────────────────────────────────────────────────────────
  const fetchListings = useCallback(
    async (opts: { search: string; genre: string; format: string; page: number; perPage: number }) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (opts.search) params.set('search', opts.search)
        if (opts.genre !== 'All') params.set('genre', opts.genre)
        if (opts.format !== 'All') params.set('format', opts.format)
        params.set('page', String(opts.page))
        params.set('per_page', String(opts.perPage))

        const res = await fetch(`/api/shop/listings?${params}`)
        if (!res.ok) return
        const data = await res.json()
        setListings(data.listings ?? [])
        setTotalCount(data.total ?? 0)
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    },
    []
  )

  // ── Debounced search ──────────────────────────────────────────────────────
  function handleSearchChange(val: string) {
    setSearch(val)
    pendingSearch.current = val
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setPage(1)
      fetchListings({ search: pendingSearch.current, genre, format, page: 1, perPage })
    }, 300)
  }

  function handleGenreChange(val: string) {
    setGenre(val)
    setPage(1)
    fetchListings({ search, genre: val, format, page: 1, perPage })
  }

  function handleFormatChange(val: string) {
    setFormat(val)
    setPage(1)
    fetchListings({ search, genre, format: val, page: 1, perPage })
  }

  function handlePerPageChange(val: number) {
    setPerPage(val)
    setPage(1)
    fetchListings({ search, genre, format, page: 1, perPage: val })
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
    fetchListings({ search, genre, format, page: newPage, perPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage))
  const start = (page - 1) * perPage
  const countX = totalCount === 0 ? 0 : start + 1
  const countY = Math.min(start + perPage, totalCount)
  const pageNums = getPageNumbers(page, totalPages)

  // ── Card styles ───────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid rgba(26,16,8,0.1)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.15s, transform 0.15s',
    textDecoration: 'none',
    color: 'inherit',
  }

  const imgWrap: React.CSSProperties = {
    position: 'relative',
    paddingBottom: '100%',
    backgroundColor: '#e8e0d0',
  }

  // ── Shopify state ─────────────────────────────────────────────────────────────
  const [sfSearch, setSfSearch] = useState('')
  const [sfGenre, setSfGenre] = useState('All')
  const [sfFormat, setSfFormat] = useState('All')
  const [sfPerPage, setSfPerPage] = useState(50)
  const [sfPage, setSfPage] = useState(1)

  const sfGenres = React.useMemo(() => {
    const all = shopifyProducts.flatMap(p => p.tags)
    return ['All', ...[...new Set(all)].filter(Boolean).sort()]
  }, [shopifyProducts])

  const sfFormats = React.useMemo(() => {
    const all = shopifyProducts.map(p => p.productType).filter(Boolean)
    return ['All', ...[...new Set(all)].sort()]
  }, [shopifyProducts])

  const sfFiltered = React.useMemo(() => {
    let results = shopifyProducts
    if (sfSearch.trim()) {
      const q = sfSearch.toLowerCase()
      results = results.filter(p => p.title.toLowerCase().includes(q))
    }
    if (sfGenre !== 'All') results = results.filter(p => p.tags.includes(sfGenre))
    if (sfFormat !== 'All') results = results.filter(p => p.productType === sfFormat)
    return results
  }, [shopifyProducts, sfSearch, sfGenre, sfFormat])

  const sfTotalPages = Math.max(1, Math.ceil(sfFiltered.length / sfPerPage))
  const sfPageItems = sfFiltered.slice((sfPage - 1) * sfPerPage, sfPage * sfPerPage)

  // Tab bar with optional cart icon on Shopify tab
  const tabBar = (active: 'discogs' | 'shopify') => (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', alignItems: 'center' }}>
      <button
        onClick={() => setShopTab('discogs')}
        style={{ padding: '0.5rem 1.25rem', borderRadius: '4px', border: active === 'discogs' ? 'none' : '1.5px solid rgba(26,16,8,0.25)', backgroundColor: active === 'discogs' ? '#C4522A' : 'transparent', color: active === 'discogs' ? '#FAF7F0' : '#1a1008', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
      >
        Discogs
      </button>
      <button
        onClick={() => setShopTab('shopify')}
        style={{ padding: '0.5rem 1.25rem', borderRadius: '4px', border: active === 'shopify' ? 'none' : '1.5px solid rgba(26,16,8,0.25)', backgroundColor: active === 'shopify' ? '#C4522A' : 'transparent', color: active === 'shopify' ? '#FAF7F0' : '#1a1008', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
      >
        Shopify
      </button>

      {/* Cart icon — only on Shopify tab */}
      {active === 'shopify' && (
        <button
          onClick={() => setCartOpen(true)}
          aria-label={`Cart (${itemCount} items)`}
          style={{
            marginLeft: 'auto',
            position: 'relative',
            background: 'none',
            border: '1.5px solid rgba(26,16,8,0.2)',
            borderRadius: '6px',
            padding: '0.45rem 0.7rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#1a1008',
          }}
        >
          <ShoppingCart size={18} />
          {itemCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-7px',
                right: '-7px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#C4522A',
                color: '#FAF7F0',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>
      )}
    </div>
  )

  if (shopTab === 'shopify') {
    return (
      <div>
        {tabBar('shopify')}

        {/* Cart drawer */}
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, flexShrink: 0 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              type="search"
              placeholder="Search titles..."
              value={sfSearch}
              onChange={e => { setSfSearch(e.target.value); setSfPage(1) }}
              style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1.5px solid rgba(26,16,8,0.25)', borderRadius: '6px', backgroundColor: '#FAF7F0', color: '#1a1008', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {sfGenres.length > 1 && (
            <div style={{ position: 'relative' }}>
              <select value={sfGenre} onChange={e => { setSfGenre(e.target.value); setSfPage(1) }} style={selectStyle} aria-label="Filter by genre">
                {sfGenres.map(g => <option key={g} value={g}>{g === 'All' ? 'All Genres' : g}</option>)}
              </select>
            </div>
          )}
          {sfFormats.length > 1 && (
            <div style={{ position: 'relative' }}>
              <select value={sfFormat} onChange={e => { setSfFormat(e.target.value); setSfPage(1) }} style={selectStyle} aria-label="Filter by format">
                {sfFormats.map(f => <option key={f} value={f}>{f === 'All' ? 'All Formats' : f}</option>)}
              </select>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a3828' }}>Per page:</label>
            <select value={sfPerPage} onChange={e => { setSfPerPage(Number(e.target.value)); setSfPage(1) }} style={{ ...selectStyle, minWidth: '70px' }}>
              {[25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <p style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#7a6555', whiteSpace: 'nowrap' }}>{sfFiltered.length} results</p>
        </div>

        {/* Grid */}
        {sfPageItems.length === 0 ? (
          <p style={{ color: '#4a3828', textAlign: 'center', padding: '3rem 0' }}>No products found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {sfPageItems.map(product => {
              const image = product.images.edges[0]?.node
              const price = parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)
              const variant = product.variants.edges[0]?.node
              return (
                <Link
                  key={product.id}
                  href={`/shop/product/${product.handle}`}
                  style={{ border: '1.5px solid rgba(26,16,8,0.12)', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit' }}
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.url} alt={image.altText ?? product.title} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} loading="eager" />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#e8e0d4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.8rem' }}>No image</div>
                  )}
                  <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{ fontWeight: 700, color: '#1a1008', fontSize: '0.9rem', marginBottom: '0.25rem', lineHeight: 1.35 }}>{product.title}</p>
                    <p style={{ color: '#C4522A', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>${price}</p>
                    {variant?.availableForSale ? (
                      <button
                        onClick={e => {
                          e.preventDefault()
                          addItem({
                            variantId: variant.id,
                            productId: product.id,
                            title: product.title,
                            price: product.priceRange.minVariantPrice.amount,
                            image: image?.url,
                          })
                          setCartOpen(true)
                        }}
                        style={{ marginTop: 'auto', padding: '0.5rem', backgroundColor: '#1a1008', color: '#FAF7F0', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <span style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.8rem', color: '#888', fontWeight: 600 }}>Sold Out</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {sfTotalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button onClick={() => setSfPage(p => Math.max(1, p - 1))} disabled={sfPage === 1} style={pageBtnStyle(false, sfPage === 1)}>‹</button>
            {getPageNumbers(sfPage, sfTotalPages).map((p, i) =>
              p === '...' ? <span key={`e${i}`} style={{ alignSelf: 'center', padding: '0 4px', color: '#888' }}>…</span>
              : <button key={p} onClick={() => setSfPage(p as number)} style={pageBtnStyle(sfPage === p, false)}>{p}</button>
            )}
            <button onClick={() => setSfPage(p => Math.min(sfTotalPages, p + 1))} disabled={sfPage === sfTotalPages} style={pageBtnStyle(false, sfPage === sfTotalPages)}>›</button>
          </div>
        )}
      </div>
    )
  }

  // ── DISCOGS tab ───────────────────────────────────────────────────────────
  return (
    <div>
      {tabBar('discogs')}
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <svg
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, flexShrink: 0 }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search artists, titles, labels…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            style={{ width: '100%', paddingLeft: '32px', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1.5px solid rgba(26,16,8,0.25)', borderRadius: '6px', backgroundColor: '#FAF7F0', color: '#1a1008', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#C4522A')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,16,8,0.25)')}
          />
        </div>

        {genres.length > 0 && (
          <div style={{ position: 'relative' }}>
            <select value={genre} onChange={e => handleGenreChange(e.target.value)} style={selectStyle} aria-label="Filter by genre">
              <option value="All">All Genres</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <select value={format} onChange={e => handleFormatChange(e.target.value)} style={selectStyle} aria-label="Filter by format">
            <option value="All">All Formats</option>
            {formats.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <label htmlFor="per-page-select" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a3828' }}>Per page:</label>
          <select id="per-page-select" value={perPage} onChange={e => handlePerPageChange(Number(e.target.value))} style={{ ...selectStyle, minWidth: '70px' }}>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </div>

      {totalCount > 0 && (
        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.25rem' }}>
          Showing {countX.toLocaleString()}–{countY.toLocaleString()} of {totalCount.toLocaleString()} records
          {format !== 'All' && ` · ${format}`}
          {search && ` · matching "${search}"`}
        </p>
      )}

      {loading ? (
        <div style={{ padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#4a3828' }}>
          <svg viewBox="0 0 80 80" width="64" height="64" aria-hidden="true" style={{ opacity: 0.7 }}>
            <circle cx="40" cy="40" r="38" fill="#1a1008" />
            {[34, 29, 24, 19].map(r => <circle key={r} cx="40" cy="40" r={r} fill="none" stroke="#2a1a0a" strokeWidth="0.8" />)}
            <circle cx="40" cy="40" r="12" fill="#2a1a0a" />
            <circle cx="40" cy="40" r="4" fill="#0a0a0a" />
            <circle cx="40" cy="40" r="36" fill="none" stroke="#C4522A" strokeWidth="1.5" strokeDasharray="20 200" opacity="0.6">
              <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
          <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading records…</p>
        </div>
      ) : listings.length === 0 ? (
        <p style={{ color: '#4a3828', padding: '2rem 0' }}>
          {search || format !== 'All'
            ? 'No records match those filters. Try broadening your search.'
            : 'No records available right now. Check back soon or stop in — the in-store selection is much larger.'}
        </p>
      ) : (
        <div className="shop-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {listings.map(listing => {
            const price = listing.price != null
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: listing.currency || 'USD' }).format(listing.price)
              : null
            const condition = listing.condition || ''

            return (
              <Link
                key={listing.listing_id}
                href={`/shop/listing/${listing.listing_id}`}
                style={cardStyle}
              >
                {/* Image */}
                <div style={imgWrap}>
                  <DiscogsImage listingId={listing.listing_id} title={listing.title ?? ''} />
                  <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(26,16,8,0.75)', color: '#FAF7F0', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: '3px' }}>
                    DISCOGS
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1008', lineHeight: 1.3, margin: 0 }}>
                    {listing.artist && (
                      <span style={{ fontWeight: 500, color: '#4a3828' }}>{listing.artist} — </span>
                    )}
                    {listing.title}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {listing.format && (
                      <p style={{ fontSize: '0.7rem', color: '#C4522A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                        {listing.format.split(',')[0].trim()}
                      </p>
                    )}
                    {listing.year != null && listing.year > 0 && (
                      <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>{listing.year}</p>
                    )}
                    {listing.label && (
                      <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>· {listing.label}</p>
                    )}
                  </div>

                  {condition && (
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: conditionColor(condition), margin: 0 }}>
                      {condition}
                    </p>
                  )}

                  {price && (
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1008', marginTop: '0.2rem' }}>{price}</p>
                  )}
                </div>

                {/* CTA */}
                <div style={{ padding: '0 0.75rem 0.75rem' }}>
                  <span
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
                      boxSizing: 'border-box',
                    }}
                  >
                    View Details
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => handlePageChange(Math.max(1, page - 1))} disabled={page === 1} style={pageBtnStyle(false, page === 1)} aria-label="Previous page">←</button>
            {pageNums.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} style={{ padding: '0.4rem 0.25rem', color: '#888', fontSize: '0.85rem', userSelect: 'none' }}>…</span>
              ) : (
                <button key={p} onClick={() => handlePageChange(p as number)} style={pageBtnStyle(p === page, false)} aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined}>{p}</button>
              )
            )}
            <button onClick={() => handlePageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={pageBtnStyle(false, page === totalPages)} aria-label="Next page">→</button>
          </div>
        </div>
      )}
    </div>
  )
}
