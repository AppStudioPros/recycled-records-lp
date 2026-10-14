import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import DashboardNav from '../DashboardNav'
import PostForm from '../PostForm'
import { notFound } from 'next/navigation'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireAuth()
  const { id } = await params
  const supabase = createAdminClient()

  const { data: post } = await supabase
    .from('rr_blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) notFound()

  return (
    <div className="flex min-h-screen">
      <DashboardNav email={profile.email} role={profile.role} />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Post</h1>
          <PostForm post={post} />
        </div>
      </main>
    </div>
  )
}
