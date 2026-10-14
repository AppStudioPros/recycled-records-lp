import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import { CalendarDays, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog | Recycled Records LP',
  description:
    'Vinyl news, store updates, and record collecting guides from Recycled Records LP in Boulder, CO.',
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
        <div className="max-w-5xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'Fraunces, serif', color: '#1a0a00' }}
            >
              From the Crate
            </h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Vinyl news, collecting tips, and updates from our Boulder shop.
            </p>
          </div>

          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                const excerpt = post.body
                  ? stripHtml(post.body).substring(0, 120) + (post.body.length > 120 ? '…' : '')
                  : ''
                const date = post.published_at ?? post.created_at

                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    {post.feature_image ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={post.feature_image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div
                        className="w-full h-48 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #C4522A 100%)' }}
                      >
                        <span className="text-4xl">🎵</span>
                      </div>
                    )}

                    <div className="p-5">
                      {post.category && (
                        <div className="flex items-center gap-1 mb-2">
                          <Tag className="w-3 h-3" style={{ color: '#C4522A' }} />
                          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#C4522A' }}>
                            {post.category}
                          </span>
                        </div>
                      )}
                      <h2 className="font-bold text-gray-900 text-lg mb-2 leading-snug group-hover:text-[#C4522A] transition-colors" style={{ fontFamily: 'Fraunces, serif' }}>
                        {post.title}
                      </h2>
                      {excerpt && (
                        <p className="text-gray-500 text-sm mb-3 leading-relaxed">{excerpt}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <CalendarDays className="w-3 h-3" />
                        <time dateTime={date}>{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl mb-2">No posts yet.</p>
              <p className="text-sm">Check back soon for vinyl news and collecting tips.</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
