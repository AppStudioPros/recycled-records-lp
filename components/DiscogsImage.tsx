'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  listingId: number
  title: string
}

export default function DiscogsImage({ listingId, title }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const fetched = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fetched.current) {
          fetched.current = true
          fetch(`/api/discogs-thumb?id=${listingId}`)
            .then(r => r.json())
            .then(({ url: imgUrl }) => {
              if (imgUrl) setUrl(imgUrl)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [listingId])

  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, background: '#1a1008', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="lazy"
        />
      ) : (
        /* Vinyl placeholder */
        <svg viewBox="0 0 80 80" width="55%" height="55%" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#111" />
          {[34, 29, 24, 19].map(r => (
            <circle key={r} cx="40" cy="40" r={r} fill="none" stroke="#1e1e1e" strokeWidth="0.8" />
          ))}
          <circle cx="40" cy="40" r="12" fill="#2a1a0a" />
          <circle cx="40" cy="40" r="4" fill="#0a0a0a" />
          {loading && (
            <circle cx="40" cy="40" r="36" fill="none" stroke="#C4522A" strokeWidth="1" strokeDasharray="20 200" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="1.5s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>
      )}
    </div>
  )
}
