import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import { CalendarDays, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog | Recycled Records LP',
  description: 'Vinyl news, store updates, and record collecting guides from Recycled Records LP in Boulder, CO.',
  alternates: { canonical: '/blog' },
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export default async function BlogPage() {
  const supabase = createAdminClient()
  const { data: posts } = await supabase
    .from('rr_blog_posts')
    .select('id, title, slug, category, feature_image, body, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <>
      <Header />
      <main style={{ background: '#FAF7F2', minHeight: '100vh' }}>

        {/* Page header */}
        <div style={{ borderBottom: '1px solid #e0d9cf', padding: '56px 4% 48px', textAlign: 'center' }}>
          <p style={{ fontSize: '.73rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#C4522A', marginBottom: '12px' }}>
            Recycled Records LPS
          </p>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', lineHeight: 1.0, letterSpacing: '-.05em', fontWeight: 800, color: '#1a0a00', margin: '0 0 16px' }}>
            From the Crate
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#5e594f', maxWidth: '480px', margin: '0 auto' }}>
            Vinyl news, collecting tips, and updates from our Boulder shop.
          </p>
        </div>

        {/* Posts grid */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 4%' }}>
          {posts && posts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '28px' }}>
              {posts.map((post) => {
                const excerpt = post.body
                  ? stripHtml(post.body).substring(0, 130) + (post.body.length > 130 ? '…' : '')
                  : ''
                const date = post.published_at ?? post.created_at

                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    style={{ display: 'block', background: '#fff', border: '1px solid #e0d9cf', textDecoration: 'none', color: 'inherit', overflow: 'hidden' }}
                    className="blog-card"
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
                      <Image
                        src={post.feature_image || '/images/blog-fallback.jpg'}
                        alt={post.title}
                        fill
                        style={{ objectFit: 'cover', transition: 'transform .3s' }}
                        className="blog-card-img"
                        unoptimized
                      />
                    </div>

                    {/* Body */}
                    <div style={{ padding: '20px 22px 24px' }}>
                      {post.category && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                          <Tag size={11} color="#C4522A" />
                          <span style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#C4522A' }}>
                            {post.category}
                          </span>
                        </div>
                      )}
                      <p style={{ fontFamily: 'var(--display)', fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-.02em', color: '#1a0a00', margin: '0 0 10px' }}>
                        {post.title}
                      </p>
                      {excerpt && (
                        <p style={{ fontSize: '.88rem', color: '#6b6358', lineHeight: 1.65, margin: '0 0 16px' }}>
                          {excerpt}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '.75rem', color: '#9a9088' }}>
                        <CalendarDays size={12} />
                        <time dateTime={date}>
                          {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </time>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9a9088' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No posts yet.</p>
              <p style={{ fontSize: '.9rem' }}>Check back soon for vinyl news and collecting tips.</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .blog-card:hover .blog-card-img { transform: scale(1.04); }
        .blog-card:hover p:first-of-type { color: #C4522A; }
      `}</style>
    </>
  )
}
