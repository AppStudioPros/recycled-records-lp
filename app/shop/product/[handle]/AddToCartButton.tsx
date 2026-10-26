'use client'
import React, { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

type Variant = {
  id: string
  title: string
  availableForSale: boolean
  price: { amount: string; currencyCode: string }
}

interface Props {
  variants: Variant[]
  productId: string
  productTitle: string
  productImage?: string
  onCartOpen?: () => void
}

export default function AddToCartButton({
  variants,
  productId,
  productTitle,
  productImage,
  onCartOpen,
}: Props) {
  const { addItem } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? '')
  const [added, setAdded] = useState(false)

  const selectedVariant = variants.find(v => v.id === selectedVariantId) ?? variants[0]
  const hasMultipleVariants = variants.length > 1 && variants.some(v => v.title !== 'Default Title')

  function handleAddToCart() {
    if (!selectedVariant || !selectedVariant.availableForSale) return
    addItem({
      variantId: selectedVariant.id,
      productId,
      title: productTitle,
      price: selectedVariant.price.amount,
      image: productImage,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    onCartOpen?.()
  }

  if (!selectedVariant) return null

  const available = selectedVariant.availableForSale

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Variant selector */}
      {hasMultipleVariants && (
        <select
          value={selectedVariantId}
          onChange={e => setSelectedVariantId(e.target.value)}
          style={{
            padding: '0.6rem 0.85rem',
            border: '1.5px solid rgba(26,16,8,0.25)',
            borderRadius: '6px',
            backgroundColor: '#FAF7F0',
            color: '#1a1008',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {variants.map(v => (
            <option key={v.id} value={v.id} disabled={!v.availableForSale}>
              {v.title}{!v.availableForSale ? ' — Sold Out' : ''}
            </option>
          ))}
        </select>
      )}

      {/* Add to cart button */}
      {available ? (
        <button
          onClick={handleAddToCart}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.85rem 2rem',
            backgroundColor: added ? '#16a34a' : '#C4522A',
            color: '#FAF7F0',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            letterSpacing: '0.03em',
            transition: 'background-color 0.2s',
          }}
        >
          {added ? (
            <>
              <Check size={18} />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              Add to Cart
            </>
          )}
        </button>
      ) : (
        <div
          style={{
            padding: '0.85rem 2rem',
            backgroundColor: 'rgba(26,16,8,0.08)',
            color: '#888',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '1rem',
            textAlign: 'center',
          }}
        >
          Sold Out
        </div>
      )}
    </div>
  )
}
