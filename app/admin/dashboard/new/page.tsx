import { requireAuth } from '@/lib/auth'
import DashboardNav from '../DashboardNav'
import PostForm from '../PostForm'

export default async function NewPostPage() {
  const profile = await requireAuth()

  return (
    <div className="flex min-h-screen">
      <DashboardNav email={profile.email} role={profile.role} />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">New Post</h1>
          <PostForm />
        </div>
      </main>
    </div>
  )
}
