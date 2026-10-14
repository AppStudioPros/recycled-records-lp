'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function parseReferrerSource(referrer: string): string {
  if (!referrer || referrer === 'direct') return 'direct'
  try {
    const url = new URL(referrer)
    const host = url.hostname.toLowerCase()
    if (host.includes('google')) return 'google'
    if (host.includes('instagram') || host.includes('ig.me')) return 'instagram'
    if (host.includes('facebook') || host.includes('fb.com') || host.includes('fb.me')) return 'facebook'
    if (host.includes('bing')) return 'bing'
    if (host.includes('yahoo')) return 'yahoo'
    if (host.includes('tiktok')) return 'tiktok'
    if (host.includes('twitter') || host.includes('x.com')) return 'twitter'
    return 'other'
  } catch {
    return 'other'
  }
}

function getDeviceType(): string {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

function getBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('Chrome/') && !ua.includes('Chromium')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Firefox/')) return 'Firefox'
  return 'Other'
}

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't track admin routes
    if (pathname?.startsWith('/admin')) return

    const referrer = document.referrer || 'direct'
    const payload = {
      page: window.location.pathname,
      referrer,
      referrer_source: parseReferrerSource(referrer),
      device_type: getDeviceType(),
      browser: getBrowser(),
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {/* silently ignore */})
  }, [pathname])

  return null
}
