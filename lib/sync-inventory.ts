/**
 * Shared Discogs → Supabase inventory sync logic.
 * Used by both the admin API route and the cron job.
 */
import { createAdminClient } from '@/lib/supabase/server'

const DISCOGS_KEY = process.env.DISCOGS_CONSUMER_KEY ?? 'JUdicElMPjcdYhSeiWPp'
const DISCOGS_SECRET = process.env.DISCOGS_CONSUMER_SECRET ?? 'dSyBJyhxYTzIyFUbHDCPsSzPCTGFCtRX'
const DISCOGS_HEADERS = {
  'User-Agent': 'RecycledRecordsLP/1.0 +https://recycledrecordslps.com',
  Authorization: `Discogs key=${DISCOGS_KEY}, secret=${DISCOGS_SECRET}`,
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export interface SyncResult {
  added: number
  updated: number
  removed: number
  totalDiscogs: number
  totalSupabase: number
  errors: string[]
}

export async function runInventorySync(opts?: {
  maxPages?: number
  fetchReleaseDetails?: boolean
  deleteStale?: boolean
}): Promise<SyncResult> {
  const {
    maxPages = 999,
    fetchReleaseDetails = true,
    deleteStale = true,
  } = opts ?? {}

  const errors: string[] = []
  const supabase = createAdminClient()

  // ── 1. Fetch all Discogs inventory pages ──────────────────────────────────
  const allListings: DiscogsRawListing[] = []
  let page = 1
  let totalPages = 1

  do {
    try {
      const res = await fetch(
        `https://api.discogs.com/users/RecycledRecordsLp/inventory?status=For+Sale&per_page=100&page=${page}&sort=listed&sort_order=desc`,
        { headers: DISCOGS_HEADERS }
      )
      if (!res.ok) {
        errors.push(`Discogs inventory page ${page}: HTTP ${res.status}`)
        break
      }
      const data = await res.json()
      const pageListings: DiscogsRawListing[] = data.listings ?? []
      allListings.push(...pageListings)
      totalPages = Math.min(data.pagination?.pages ?? 1, maxPages)
    } catch (e) {
      errors.push(`Discogs inventory page ${page}: ${e}`)
      break
    }
    page++
    if (page <= totalPages) await sleep(1100) // stay under 60 req/min
  } while (page <= totalPages)

  // ── 2. Load existing Supabase rows (listing_id + genres) ─────────────────
  const { data: existing } = await supabase
    .from('rr_inventory')
    .select('listing_id, genres')

  const existingMap = new Map<number, { genres: string[] }>(
    (existing ?? []).map(r => [r.listing_id as number, { genres: r.genres as string[] }])
  )

  const discogsIds = new Set(allListings.map(l => l.id))

  // ── 3. Fetch release details for new/genre-less listings ──────────────────
  const releaseCache = new Map<number, { genres: string[]; styles: string[] }>()

  if (fetchReleaseDetails) {
    const needsRelease = allListings.filter(l => {
      const ex = existingMap.get(l.id)
      return !ex || !ex.genres || ex.genres.length === 0
    })

    for (const listing of needsRelease) {
      const rId = listing.release.id
      if (releaseCache.has(rId)) continue
      try {
        const r = await fetch(`https://api.discogs.com/releases/${rId}`, { headers: DISCOGS_HEADERS })
        if (r.ok) {
          const rd = await r.json()
          releaseCache.set(rId, { genres: rd.genres ?? [], styles: rd.styles ?? [] })
        }
      } catch { /* skip */ }
      await sleep(1100)
    }
  }

  // ── 4. Build upsert rows ──────────────────────────────────────────────────
  const now = new Date().toISOString()
  const rows = allListings.map(l => {
    const fromRelease = releaseCache.get(l.release.id)
    const fromExisting = existingMap.get(l.id)
    return {
      listing_id: l.id,
      release_id: l.release.id,
      title: l.release.title ?? null,
      artist: l.release.artist ?? null,
      format: l.release.format ?? null,
      genres: fromRelease?.genres ?? fromExisting?.genres ?? [],
      styles: fromRelease?.styles ?? [],
      condition: l.condition ?? null,
      sleeve_condition: l.sleeve_condition ?? null,
      price: l.price?.value != null ? parseFloat(String(l.price.value)) : null,
      currency: l.price?.currency ?? 'USD',
      listing_url: l.uri ?? null,
      year: l.release.year ?? null,
      label: l.release.label ?? null,
      country: l.release.country ?? null,
      notes: l.comments ?? null,
      status: 'For Sale',
      last_synced: now,
    }
  })

  // ── 5. Upsert in batches of 100 ───────────────────────────────────────────
  let added = 0
  let updated = 0

  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100)
    const { error: upsertErr } = await supabase.from('rr_inventory').upsert(batch, {
      onConflict: 'listing_id',
    })
    if (upsertErr) errors.push(`Upsert batch ${i}: ${upsertErr.message}`)

    // Count added vs updated
    batch.forEach(r => {
      if (existingMap.has(r.listing_id)) updated++
      else added++
    })
  }

  // ── 6. Delete stale listings (sold/removed from Discogs) ──────────────────
  let removed = 0
  if (deleteStale) {
    const staleIds = [...existingMap.keys()].filter(id => !discogsIds.has(id))
    if (staleIds.length > 0) {
      for (let i = 0; i < staleIds.length; i += 100) {
        const batch = staleIds.slice(i, i + 100)
        const { error: delErr } = await supabase.from('rr_inventory').delete().in('listing_id', batch)
        if (!delErr) removed += batch.length
        else errors.push(`Delete batch: ${delErr.message}`)
      }
    }
  }

  // ── 7. Final count ────────────────────────────────────────────────────────
  const { count: totalSupabase } = await supabase
    .from('rr_inventory')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'For Sale')

  return {
    added,
    updated,
    removed,
    totalDiscogs: allListings.length,
    totalSupabase: totalSupabase ?? 0,
    errors,
  }
}

// ── Discogs API types ─────────────────────────────────────────────────────────

interface DiscogsRawListing {
  id: number
  uri: string
  condition: string
  sleeve_condition: string
  comments: string
  price: { value: number; currency: string }
  release: {
    id: number
    title: string
    artist: string
    format: string
    year: number
    label: string
    country?: string
  }
}
