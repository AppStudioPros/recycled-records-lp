import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = createAdminClient()

  try {
    // Get distinct formats
    const { data: formatRows } = await supabase
      .from('rr_inventory')
      .select('format')
      .eq('status', 'For Sale')
      .not('format', 'is', null)

    const formats = [
      ...new Set(formatRows?.map(r => r.format as string).filter(Boolean) ?? []),
    ]
      .map(f => {
        // Normalize: take first part before comma (e.g. "LP, Album" → "LP")
        const normalized = f.split(',')[0].trim()
        return normalized
      })
      .filter(Boolean)

    const uniqueFormats = [...new Set(formats)].sort()

    // Get distinct genres (flatten arrays)
    const { data: genreRows } = await supabase
      .from('rr_inventory')
      .select('genres')
      .eq('status', 'For Sale')
      .not('genres', 'is', null)

    const allGenres = genreRows?.flatMap(r => (r.genres as string[]) ?? []) ?? []
    const genres = [...new Set(allGenres)].filter(Boolean).sort()

    return NextResponse.json(
      { genres, formats: uniqueFormats },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' } }
    )
  } catch (err) {
    return NextResponse.json({ genres: [], formats: [], error: String(err) }, { status: 500 })
  }
}
