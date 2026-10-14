import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import DashboardNav from '../DashboardNav'
import Link from 'next/link'
import PostsClient from './PostsClient'

export default async function PostsPage() {
  const profile = await requireAuth()
  const supabase = createAdminClient()

  const { data: posts } = await supabase
    .from('rr_blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen">
      <DashboardNav email={profile.email} role={profile.role} />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
            <Link
              href="/admin/dashboard/new"
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
              style={{ background: '#C4522A' }}
            >
              + New Post
            </Link>
          </div>
          <PostsClient posts={posts ?? []} />
        </div>
      </main>
    </div>
  )
}
