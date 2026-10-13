import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get('page') ?? '1'
  const key = process.env.DISCOGS_CONSUMER_KEY ?? ''
  const secret = process.env.DISCOGS_CONSUMER_SECRET ?? ''

  try {
    const res = await fetch(
      `https://api.discogs.com/users/RecycledRecordsLp/inventory?status=For+Sale&per_page=100&page=${page}&sort=listed&sort_order=desc`,
      {
        headers: {
          'User-Agent': 'RecycledRecordsLP/1.0 +https://recycledrecordslps.com',
          Authorization: `Discogs key=${key}, secret=${secret}`,
        },
      }
    )
    if (!res.ok) return NextResponse.json({ listings: [], pages: 1 }, { status: 500 })
    const data = await res.json()
    return NextResponse.json(
      { listings: data.listings ?? [], pages: data.pagination?.pages ?? 1, items: data.pagination?.items ?? 0 },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch {
    return NextResponse.json({ listings: [], pages: 1 })
  }
}
