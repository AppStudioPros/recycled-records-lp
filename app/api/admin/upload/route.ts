import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Vercel Blob
      const blob = await put(filename, file, { access: 'public' })
      return NextResponse.json({ url: blob.url })
    }

    // Fallback: Supabase Storage
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = createAdminClient()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error } = await supabase.storage
      .from('rr-blog-images')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: urlData } = supabase.storage.from('rr-blog-images').getPublicUrl(filename)
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
