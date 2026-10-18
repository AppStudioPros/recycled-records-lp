import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const genre = searchParams.get('genre') || 'All'
  const format = searchParams.get('format') || 'All'
  const search = (searchParams.get('search') || '').trim()
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const per_page = Math.min(200, Math.max(1, parseInt(searchParams.get('per_page') || '50')))
  const start = (page - 1) * per_page

  const supabase = createAdminClient()

  try {
    let query = supabase
      .from('rr_inventory')
      .select('*', { count: 'exact' })
      .eq('status', 'For Sale')

    if (genre && genre !== 'All') {
      query = query.contains('genres', [genre])
    }
    if (format && format !== 'All') {
      query = query.ilike('format', `%${format}%`)
    }
    if (search) {
      // Escape special chars for ilike
      const escaped = search.replace(/[%_]/g, c => `\\${c}`)
      query = query.or(
        `title.ilike.%${escaped}%,artist.ilike.%${escaped}%,label.ilike.%${escaped}%,notes.ilike.%${escaped}%`
      )
    }

    query = query.range(start, start + per_page - 1).order('listing_id', { ascending: false })

    const { data: listings, count, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { listings: listings ?? [], total: count ?? 0, page, per_page },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
