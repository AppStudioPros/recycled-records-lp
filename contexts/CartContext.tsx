'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type CartItem = {
  variantId: string
  productId: string
  title: string
  price: string
  image?: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  itemCount: number
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, qty: number) => void
  clearCart: () => void
  checkout: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rr-cart')
      if (stored) setItems(JSON.parse(stored))
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem('rr-cart', JSON.stringify(items))
    } catch { /* ignore */ }
  }, [items, hydrated])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems(prev => {
      const existing = prev.find(i => i.variantId === item.variantId)
      if (existing) {
        return prev.map(i =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
            : i
        )
      }
      return [...prev, { ...item, quantity: item.quantity ?? 1 }]
    })
  }, [])

  const removeItem = useCallback((variantId: string) => {
    setItems(prev => prev.filter(i => i.variantId !== variantId))
  }, [])

  const updateQty = useCallback((variantId: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.variantId !== variantId))
      return
    }
    setItems(prev => prev.map(i => i.variantId === variantId ? { ...i, quantity: qty } : i))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const checkout = useCallback(async () => {
    if (items.length === 0) return
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        clearCart()
        window.location.href = data.checkoutUrl
      }
    } catch { /* silent */ }
  }, [items, clearCart])

  return (
    <CartContext.Provider value={{ items, itemCount, addItem, removeItem, updateQty, clearCart, checkout }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
