'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface PostFormProps {
  post?: {
    id: string
    title: string
    slug: string
    status: string
    category: string | null
    meta_description: string | null
    feature_image: string | null
    body: string | null
  }
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export default function PostForm({ post }: PostFormProps) {
  const router = useRouter()
  const isEdit = !!post

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [category, setCategory] = useState(post?.category ?? '')
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [featureImage, setFeatureImage] = useState(post?.feature_image ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Auto-generate slug from title (only on new post)
  useEffect(() => {
    if (!isEdit && title) {
      setSlug(slugify(title))
    }
  }, [title, isEdit])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setFeatureImage(data.url)
      else throw new Error(data.error ?? 'Upload failed')
    } catch (err) {
      alert('Image upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(status: 'draft' | 'published') {
    if (!title.trim()) { setError('Title is required.'); return }
    if (!slug.trim()) { setError('Slug is required.'); return }
    setError('')
    setSaving(true)

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      category: category.trim() || null,
      meta_description: metaDescription.trim() || null,
      body: body.trim() || null,
      feature_image: featureImage || null,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    }

    const url = isEdit ? `/api/admin/posts/${post.id}` : '/api/admin/posts'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSaving(false)

    if (res.ok) {
      router.push('/admin/dashboard/posts')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to save post.')
    }
  }

  return (
    <div className="max-w-3xl">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4522A] bg-white text-gray-900"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="post-url-slug"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4522A] bg-white text-gray-900 font-mono text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">URL: /blog/{slug || 'post-slug'}</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Vinyl News, Store Updates, Collecting Tips"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4522A] bg-white text-gray-900"
          />
        </div>

        {/* Meta description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            maxLength={160}
            placeholder="Brief description for search engines (max 160 chars)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4522A] bg-white text-gray-900 resize-none"
          />
          <p className="text-xs text-gray-400 mt-0.5">{metaDescription.length}/160</p>
        </div>
      </div>

      {/* Featured image */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">Featured Image</label>
        {featureImage && (
          <div className="mb-3 relative w-full h-48 rounded-lg overflow-hidden">
            <Image src={featureImage} alt="Featured" fill className="object-cover" unoptimized />
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-700 transition-colors">
            {uploading ? (
              <>
                <Upload className="w-4 h-4 animate-pulse" /> Uploading…
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" /> {featureImage ? 'Change Image' : 'Upload Image'}
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          {featureImage && (
            <button
              onClick={() => setFeatureImage('')}
              className="text-sm text-red-500 hover:underline"
            >
              Remove
            </button>
          )}
        </div>
        {featureImage && (
          <p className="text-xs text-gray-400 mt-2 break-all">{featureImage}</p>
        )}
      </div>

      {/* Body */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Body Content <span className="text-gray-400 font-normal">(HTML accepted)</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          placeholder="<p>Write your post here. HTML is supported.</p>"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4522A] bg-white text-gray-900 font-mono text-sm resize-y"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button
          onClick={() => handleSave('published')}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
          style={{ background: '#C4522A' }}
        >
          {saving ? 'Publishing…' : 'Publish'}
        </button>
        <button
          onClick={() => router.back()}
          className="ml-auto text-sm text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
