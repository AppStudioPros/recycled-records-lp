export type DiscogsListing = {
  id: number
  uri: string
  release: {
    id: number
    title: string
    artist: string
    year: number
    format: string
    thumb: string
    cover_image: string
    genres: string[]
    styles: string[]
  }
  condition: string
  sleeve_condition: string
  price: {
    value: number
    currency: string
  }
  comments: string
}

export async function getDiscogsInventory(username: string, perPage = 100): Promise<{ listings: DiscogsListing[]; total: number; pages: number }> {
  try {
    const key = process.env.DISCOGS_CONSUMER_KEY ?? ''
    const secret = process.env.DISCOGS_CONSUMER_SECRET ?? ''
    const auth = key ? `Discogs key=${key}, secret=${secret}` : ''
    const res = await fetch(
      `https://api.discogs.com/users/${username}/inventory?status=For+Sale&per_page=${perPage}&sort=listed&sort_order=desc`,
      {
        headers: {
          'User-Agent': 'RecycledRecordsLP/1.0 +https://recycledrecordslps.com',
          ...(auth ? { Authorization: auth } : {}),
        },
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) return { listings: [], total: 0, pages: 1 }
    const data = await res.json()
    return {
      listings: data.listings ?? [],
      total: data.pagination?.items ?? 0,
      pages: data.pagination?.pages ?? 1,
    }
  } catch {
    return { listings: [], total: 0, pages: 1 }
  }
}
