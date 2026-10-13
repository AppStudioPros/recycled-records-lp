import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Shop Vinyl Records Online — Recycled Records LP'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', background: '#1a1008', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 100px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -80, top: '50%', transform: 'translateY(-50%)', width: 500, height: 500, borderRadius: '50%', border: '2px solid rgba(242,235,221,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 360, height: 360, borderRadius: '50%', border: '2px solid rgba(242,235,221,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(196,82,42,0.3)' }} />
        </div>
      </div>
      <div style={{ color: '#C4522A', fontSize: 18, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 28, fontFamily: 'serif' }}>Online Shop · Boulder, Colorado</div>
      <div style={{ color: '#F2EBDD', fontSize: 86, fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.04em', fontFamily: 'Georgia, serif', marginBottom: 32 }}>Dig through<br />the crates.</div>
      <div style={{ width: 80, height: 4, background: '#C4522A', marginBottom: 32 }} />
      <div style={{ color: 'rgba(242,235,221,0.65)', fontSize: 24, fontFamily: 'Georgia, serif' }}>Vinyl · CDs · Cassettes · Vintage Audio · Recycled Records LP</div>
    </div>,
    { ...size }
  )
}
