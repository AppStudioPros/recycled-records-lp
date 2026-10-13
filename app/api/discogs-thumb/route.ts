import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ url: null }, { status: 400 })

  const key = process.env.DISCOGS_CONSUMER_KEY ?? ''
  const secret = process.env.DISCOGS_CONSUMER_SECRET ?? ''

  try {
    const res = await fetch(`https://api.discogs.com/marketplace/listings/${id}`, {
      headers: {
        'User-Agent': 'RecycledRecordsLP/1.0 +https://recycledrecordslps.com',
        Authorization: `Discogs key=${key}, secret=${secret}`,
      },
    })
    if (!res.ok) return NextResponse.json({ url: null })
    const data = await res.json()
    const thumb = data?.release?.thumbnail ?? data?.release?.images?.[0]?.uri150 ?? null
    return NextResponse.json(
      { url: thumb },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch {
    return NextResponse.json({ url: null })
  }
}
