import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth()
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('rr_blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()
    const { title, slug, category, meta_description, body: postBody, feature_image, status, published_at } = body

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('rr_blog_posts')
      .insert({
        title,
        slug,
        category: category ?? null,
        meta_description: meta_description ?? null,
        body: postBody ?? null,
        feature_image: feature_image ?? null,
        status: status ?? 'draft',
        published_at: published_at ?? null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
