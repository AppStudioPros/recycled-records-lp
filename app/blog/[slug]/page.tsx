import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import { CalendarDays, Tag, ArrowLeft } from 'lucide-react'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('rr_blog_posts')
    .select('slug')
    .eq('status', 'published')
  return (data ?? []).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()
  const { data: post } = await supabase
    .from('rr_blog_posts')
    .select('title, meta_description, feature_image')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) return { title: 'Post Not Found | Recycled Records LP' }

  return {
    title: `${post.title} | Recycled Records LP`,
    description: post.meta_description ?? undefined,
    openGraph: post.feature_image
      ? { images: [{ url: post.feature_image }] }
      : undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: post } = await supabase
    .from('rr_blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://recycledrecordslps.com'
  const date = post.published_at ?? post.created_at

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description ?? undefined,
    image: post.feature_image ?? undefined,
    datePublished: date,
    dateModified: post.updated_at ?? date,
    url: `${siteUrl}/blog/${post.slug}`,
    author: {
      '@type': 'Organization',
      name: 'Recycled Records LP',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Recycled Records LP',
      url: siteUrl,
    },
  }

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{ background: '#FAF7F2', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto px-4 py-16">
          {/* Back */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm mb-8 hover:underline"
            style={{ color: '#C4522A' }}
          >
            <ArrowLeft className="w-4 h-4" />
            All Posts
          </Link>

          {/* Category */}
          {post.category && (
            <div className="flex items-center gap-1 mb-3">
              <Tag className="w-3.5 h-3.5" style={{ color: '#C4522A' }} />
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#C4522A' }}>
                {post.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            {post.title}
          </h1>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-8">
            <CalendarDays className="w-4 h-4" />
            <time dateTime={date}>
              {new Date(date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>

          {/* Featured image */}
          {post.feature_image && (
            <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8">
              <Image
                src={post.feature_image}
                alt={post.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          )}

          {/* Body */}
          {post.body && (
            <article
              className="prose prose-stone max-w-none"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          )}

          {/* Back link bottom */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm hover:underline"
              style={{ color: '#C4522A' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all posts
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
