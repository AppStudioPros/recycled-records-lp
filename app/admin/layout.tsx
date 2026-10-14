import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin | Recycled Records LP',
  description: 'Admin panel for Recycled Records LP',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#FAF7F2' }}>
      {children}
    </div>
  )
}
