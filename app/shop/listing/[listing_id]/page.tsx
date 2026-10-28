import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import Header from '@/components/Header'
import type { RRListing } from '@/lib/types/rr-inventory'

// ── Supabase ──────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Discogs release shape ─────────────────────────────────────────────────────
type Track = { position: string; title: string; duration: string }
type DiscogsRelease = {
  title?: string
  artists?: { name: string }[]
  labels?: { name: string; catno: string }[]
  year?: number
  country?: string
  formats?: { name: string; descriptions?: string[] }[]
  genres?: string[]
  styles?: string[]
  tracklist?: Track[]
  images?: { resource_url: string; type: string }[]
  notes?: string
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ listing_id: string }> }
): Promise<Metadata> {
  const { listing_id } = await params
  const id = parseInt(listing_id, 10)
  if (isNaN(id)) return { title: 'Record Not Found' }

  const supabase = getSupabase()
  const { data } = await supabase
    .from('rr_inventory')
    .select('title, artist, price, currency')
    .eq('listing_id', id)
    .single()

  if (!data) return { title: 'Record Not Found' }

  const name = data.artist ? `${data.artist} — ${data.title}` : data.title
  return {
    title: `${name} | Recycled Records LP`,
    description: `Buy "${data.title}" on Discogs from Recycled Records LP in Boulder, CO. Ultrasonically cleaned and graded.`,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function conditionColor(c: string): string {
  if (!c) return '#888'
  const u = c.toLowerCase()
  if (u.includes('mint') || u.startsWith('nm') || u.startsWith('m')) return '#16a34a'
  if (u.includes('vg+') || u.includes('vg ')) return '#C4522A'
  if (u.includes('vg')) return '#d97706'
  return '#888'
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: '0.68rem', letterSpacing: '0.09em', textTransform: 'uppercase', color: '#999', marginBottom: '0.2rem', fontWeight: 700 }}>
        {label}
      </p>
      <p style={{ fontWeight: 600, color: '#1a1008', fontSize: '0.88rem' }}>{value}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ListingPage(
  { params }: { params: Promise<{ listing_id: string }> }
) {
  const { listing_id } = await params
  const listingId = parseInt(listing_id, 10)
  if (isNaN(listingId)) notFound()

  const supabase = getSupabase()
  const { data: listing } = await supabase
    .from('rr_inventory')
    .select('*')
    .eq('listing_id', listingId)
    .single()

  if (!listing) notFound()

  // Fetch Discogs release for tracklist + images
  let release: DiscogsRelease | null = null
  if (listing.release_id) {
    try {
      const res = await fetch(
        `https://api.discogs.com/releases/${listing.release_id}`,
        {
          headers: {
            'User-Agent': 'RecycledRecordsLP/1.0 +https://recycledrecordslps.com',
            Authorization: `Discogs key=${process.env.DISCOGS_CONSUMER_KEY}, secret=${process.env.DISCOGS_CONSUMER_SECRET}`,
          },
          next: { revalidate: 60 },
        }
      )
      if (res.ok) release = await res.json()
    } catch { /* silent */ }
  }

  const l = listing as RRListing

  const price = l.price != null
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: l.currency || 'USD',
      }).format(l.price)
    : null

  const buyUrl = `https://www.discogs.com/sell/item/${listingId}`

  // Prefer primary image from Discogs release
  const primaryImage = release?.images?.find(img => img.type === 'primary')?.resource_url
    ?? release?.images?.[0]?.resource_url

  const genres: string[] = release?.genres ?? (Array.isArray(l.genres) ? l.genres : [])
  const tracklist: Track[] = release?.tracklist ?? []

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0' }}>
      <Header />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        {/* Back */}
        <Link
          href="/shop"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: '#C4522A',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            marginBottom: '2rem',
          }}
        >
          ← Back to Shop
        </Link>

        {/* Main layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 360px) minmax(0, 1fr)',
            gap: '3rem',
            alignItems: 'start',
          }}
          className="listing-detail-grid"
        >
          {/* ── Image ─────────────────────────────────────────────────── */}
          <div
            style={{
              aspectRatio: '1',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#1a1008',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage}
                alt={l.title ?? 'Album artwork'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <svg viewBox="0 0 80 80" width="60%" height="60%" aria-hidden="true">
                <circle cx="40" cy="40" r="38" fill="#111" />
                {[34, 29, 24, 19].map(r => (
                  <circle key={r} cx="40" cy="40" r={r} fill="none" stroke="#1e1e1e" strokeWidth="0.8" />
                ))}
                <circle cx="40" cy="40" r="12" fill="#2a1a0a" />
                <circle cx="40" cy="40" r="4" fill="#0a0a0a" />
              </svg>
            )}
          </div>

          {/* ── Details ───────────────────────────────────────────────── */}
          <div>
            {/* DISCOGS badge */}
            <div style={{ marginBottom: '0.6rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#1a1008',
                  color: '#FAF7F0',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  padding: '2px 8px',
                  borderRadius: '3px',
                }}
              >
                DISCOGS LISTING
              </span>
            </div>

            {/* Artist */}
            {l.artist && (
              <p
                style={{
                  color: '#C4522A',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  letterSpacing: '0.04em',
                  marginBottom: '0.4rem',
                }}
              >
                {l.artist}
              </p>
            )}

            {/* Title */}
            <h1
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(1.5rem, 4vw, 2.3rem)',
                color: '#1a1008',
                lineHeight: 1.15,
                marginBottom: '1.5rem',
              }}
            >
              {l.title}
            </h1>

            {/* Condition row */}
            {(l.condition || l.sleeve_condition) && (
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {l.condition && (
                  <div>
                    <p style={{ fontSize: '0.68rem', letterSpacing: '0.09em', textTransform: 'uppercase', color: '#999', marginBottom: '0.2rem', fontWeight: 700 }}>Media</p>
                    <p style={{ fontWeight: 700, color: conditionColor(l.condition), fontSize: '0.9rem' }}>{l.condition}</p>
                  </div>
                )}
                {l.sleeve_condition && (
                  <div>
                    <p style={{ fontSize: '0.68rem', letterSpacing: '0.09em', textTransform: 'uppercase', color: '#999', marginBottom: '0.2rem', fontWeight: 700 }}>Sleeve</p>
                    <p style={{ fontWeight: 700, color: conditionColor(l.sleeve_condition), fontSize: '0.9rem' }}>{l.sleeve_condition}</p>
                  </div>
                )}
              </div>
            )}

            {/* Meta grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.8rem 2rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: 'rgba(26,16,8,0.04)',
                borderRadius: '6px',
              }}
            >
              {l.label && <MetaRow label="Label" value={l.label} />}
              {l.year > 0 && <MetaRow label="Year" value={String(l.year)} />}
              {l.country && <MetaRow label="Country" value={l.country} />}
              {l.format && <MetaRow label="Format" value={l.format.split(',')[0].trim()} />}
              {genres.length > 0 && <MetaRow label="Genre" value={genres.join(', ')} />}
            </div>

            {/* Notes */}
            {l.notes && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(196,82,42,0.07)',
                  borderLeft: '3px solid #C4522A',
                  borderRadius: '0 4px 4px 0',
                }}
              >
                <p style={{ fontSize: '0.85rem', color: '#4a3828', lineHeight: 1.65, margin: 0 }}>
                  {l.notes}
                </p>
              </div>
            )}

            {/* Price */}
            {price && (
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1008', marginBottom: '1.25rem' }}>
                {price}
              </p>
            )}

            {/* CTA */}
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.85rem 2rem',
                backgroundColor: '#C4522A',
                color: '#FAF7F0',
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: '6px',
                textDecoration: 'none',
                letterSpacing: '0.03em',
              }}
            >
              Buy on Discogs →
            </a>
          </div>
        </div>

        {/* ── Tracklist ─────────────────────────────────────────────────── */}
        {tracklist.length > 0 && (
          <div style={{ marginTop: '3.5rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: '1.5rem',
                color: '#1a1008',
                marginBottom: '1rem',
                paddingBottom: '0.6rem',
                borderBottom: '2px solid #1a1008',
              }}
            >
              Tracklist
            </h2>
            <div>
              {tracklist.map((track, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.6rem 0',
                    borderBottom: '1px solid rgba(26,16,8,0.08)',
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#C4522A', minWidth: '2.5rem', fontSize: '0.8rem' }}>
                    {track.position}
                  </span>
                  <span style={{ flex: 1, color: '#1a1008', fontSize: '0.9rem' }}>{track.title}</span>
                  {track.duration && (
                    <span style={{ color: '#999', fontSize: '0.8rem', flexShrink: 0 }}>{track.duration}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .listing-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
