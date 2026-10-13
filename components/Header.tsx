'use client'
import { useState, useEffect } from 'react'
import { store } from '@/lib/store'

const shopTarget = store.shopUrl ?? '/shop'

const navLinks = [
  { label: 'Online Shop', href: shopTarget },
  { label: 'Turntables & Audio', href: '/#audio' },
  { label: 'Sell Your Collection', href: '/sell' },
  { label: 'Visit Us', href: '/#visit' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 761px)')
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <>
      <header className="header">
        <a className="wordmark" href="/" aria-label="Recycled Records LP home">
          RECYCLED<br />RECORDS LP<span className="wordmark-dot">●</span>
        </a>

        {/* Desktop nav */}
        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map(l => <a key={l.label} href={l.href}>{l.label}</a>)}
        </nav>
        <a className="header-call desktop-nav" href={store.phoneHref}>Call the shop</a>

        {/* Mobile: phone + hamburger */}
        <div className="mobile-header-right">
          <a href={store.phoneHref} className="mobile-call" aria-label="Call the shop">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </a>
          <button
            className="hamburger"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="nav-overlay" role="dialog" aria-modal="true" aria-label="Navigation menu">
          {/* Backdrop */}
          <div className="nav-backdrop" onClick={() => setOpen(false)} />

          {/* Drawer */}
          <div className="nav-drawer">
            <div className="nav-drawer-top">
              <a className="wordmark" href="/" onClick={() => setOpen(false)} aria-label="Recycled Records LP home">
                RECYCLED<br />RECORDS LP<span className="wordmark-dot">●</span>
              </a>
              <button className="nav-close" onClick={() => setOpen(false)} aria-label="Close menu">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <nav className="nav-drawer-links" aria-label="Mobile navigation">
              {navLinks.map(l => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="nav-drawer-footer">
              <a href={store.phoneHref} className="button" style={{ display: 'inline-block', textAlign: 'center' }}>
                Call {store.phone}
              </a>
              <address style={{ fontStyle: 'normal', fontSize: '0.85rem', opacity: 0.7, marginTop: '1rem', lineHeight: 1.5 }}>
                {store.address}<br />{store.locality}
              </address>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
