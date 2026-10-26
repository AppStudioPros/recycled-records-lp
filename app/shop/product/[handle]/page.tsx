import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { getProductByHandle } from '@/lib/shopify'
import AddToCartButton from './AddToCartButton'

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ handle: string }> }
): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) return { title: 'Product Not Found' }

  const price = parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)
  return {
    title: `${product.title} | Recycled Records LP`,
    description: product.description
      ? product.description.slice(0, 160)
      : `Buy ${product.title} from Recycled Records LP in Boulder, CO. $${price}.`,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ProductPage(
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()

  const images = product.images.edges.map(e => e.node)
  const variants = product.variants.edges.map(e => e.node)
  const price = parseFloat(product.priceRange.minVariantPrice.amount)
  const currency = product.priceRange.minVariantPrice.currencyCode
  const priceStr = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
  const firstImage = images[0]

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
            gridTemplateColumns: 'minmax(0, 420px) minmax(0, 1fr)',
            gap: '3rem',
            alignItems: 'start',
          }}
          className="product-detail-grid"
        >
          {/* ── Images ────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {/* Primary */}
            <div
              style={{
                aspectRatio: '1',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#e8e0d4',
              }}
            >
              {firstImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={firstImage.url}
                  alt={firstImage.altText ?? product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontSize: '0.85rem',
                  }}
                >
                  No image
                </div>
              )}
            </div>

            {/* Additional thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {images.slice(1, 6).map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img.url}
                    alt={img.altText ?? `${product.title} image ${i + 2}`}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1.5px solid rgba(26,16,8,0.12)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Details ───────────────────────────────────────────────── */}
          <div>
            {/* Shopify badge */}
            <div style={{ marginBottom: '0.6rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#C4522A',
                  color: '#FAF7F0',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  padding: '2px 8px',
                  borderRadius: '3px',
                }}
              >
                IN-STOCK
              </span>
            </div>

            {/* Product type */}
            {product.productType && (
              <p
                style={{
                  color: '#C4522A',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '0.4rem',
                }}
              >
                {product.productType}
              </p>
            )}

            {/* Title */}
            <h1
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(1.5rem, 4vw, 2.3rem)',
                color: '#1a1008',
                lineHeight: 1.15,
                marginBottom: '0.75rem',
              }}
            >
              {product.title}
            </h1>

            {/* Price */}
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1a1008', marginBottom: '1.25rem' }}>
              {priceStr}
            </p>

            {/* Description */}
            {product.description && (
              <p
                style={{
                  color: '#4a3828',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem',
                  maxWidth: '480px',
                }}
              >
                {product.description}
              </p>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {product.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      padding: '2px 10px',
                      backgroundColor: 'rgba(26,16,8,0.07)',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#4a3828',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Add to Cart */}
            <AddToCartButton
              variants={variants}
              productId={product.id}
              productTitle={product.title}
              productImage={firstImage?.url}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
