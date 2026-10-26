'use client'
import React from 'react'
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, itemCount, removeItem, updateQty, checkout } = useCart()

  const subtotal = items.reduce((sum, item) => {
    const p = parseFloat(item.price)
    return sum + (isNaN(p) ? 0 : p) * item.quantity
  }, 0)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 998,
          }}
        />
      )}

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#FAF7F0',
          zIndex: 999,
          boxShadow: '-4px 0 32px rgba(0,0,0,0.18)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.32,0,0.67,0)',
          display: 'flex',
          flexDirection: 'column',
        }}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1.5px solid rgba(26,16,8,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={20} color="#1a1008" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1008' }}>
              Cart {itemCount > 0 && `(${itemCount})`}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
            }}
          >
            <X size={20} color="#1a1008" />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#7a6555' }}>
              <ShoppingCart
                size={40}
                style={{ margin: '0 auto 1rem', opacity: 0.25, display: 'block' }}
              />
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem', color: '#1a1008' }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: '0.85rem' }}>Browse the shop and add something good.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map(item => (
                <div
                  key={item.variantId}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    border: '1px solid rgba(26,16,8,0.1)',
                  }}
                >
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: '#1a1008',
                        lineHeight: 1.3,
                        marginBottom: '0.2rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}
                    </p>
                    <p style={{ color: '#C4522A', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {/* Minus */}
                      <button
                        onClick={() => updateQty(item.variantId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        style={{
                          width: '26px',
                          height: '26px',
                          border: '1.5px solid rgba(26,16,8,0.2)',
                          borderRadius: '4px',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          minWidth: '22px',
                          textAlign: 'center',
                        }}
                      >
                        {item.quantity}
                      </span>
                      {/* Plus */}
                      <button
                        onClick={() => updateQty(item.variantId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        style={{
                          width: '26px',
                          height: '26px',
                          border: '1.5px solid rgba(26,16,8,0.2)',
                          borderRadius: '4px',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Plus size={12} />
                      </button>
                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.variantId)}
                        aria-label="Remove item"
                        style={{
                          marginLeft: 'auto',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#aaa',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '4px',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1.5px solid rgba(26,16,8,0.12)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '1rem',
              }}
            >
              <span style={{ fontWeight: 600, color: '#4a3828', fontSize: '0.9rem' }}>Subtotal</span>
              <span style={{ fontWeight: 700, color: '#1a1008', fontSize: '1.1rem' }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={checkout}
              style={{
                width: '100%',
                padding: '0.8rem',
                backgroundColor: '#C4522A',
                color: '#FAF7F0',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                marginBottom: '0.5rem',
                letterSpacing: '0.03em',
              }}
            >
              Checkout →
            </button>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.65rem',
                backgroundColor: 'transparent',
                color: '#1a1008',
                border: '1.5px solid rgba(26,16,8,0.2)',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
