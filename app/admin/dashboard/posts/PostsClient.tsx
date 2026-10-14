'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'

interface Post {
  id: string
  title: string
  slug: string
  status: string
  category: string | null
  created_at: string
  published_at: string | null
}

export default function PostsClient({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete post.')
    }
    setDeletingId(null)
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 shadow-sm">
        No posts yet.{' '}
        <Link href="/admin/dashboard/new" className="underline" style={{ color: '#C4522A' }}>
          Create one
        </Link>
        .
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
            <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
              <td className="px-5 py-3 font-medium text-gray-800">{post.title}</td>
              <td className="px-5 py-3 text-gray-500">{post.category ?? '—'}</td>
              <td className="px-5 py-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {post.status}
                </span>
              </td>
              <td className="px-5 py-3 text-gray-400 text-xs">
                {new Date(post.created_at).toLocaleDateString()}
              </td>
              <td className="px-5 py-3 text-right flex items-center justify-end gap-2">
                <Link
                  href={`/admin/dashboard/${post.id}`}
                  className="p-1.5 text-gray-400 hover:text-[#C4522A] rounded transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  disabled={deletingId === post.id}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
