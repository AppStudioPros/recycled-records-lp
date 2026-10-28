/**
 * Full inventory sync: Discogs → Supabase rr_inventory
 * Run: npx ts-node --project tsconfig.json scripts/sync-inventory.ts
 * Or: npx tsx scripts/sync-inventory.ts
 *
 * Fetches ALL inventory pages, enriches with release genres/styles,
 * upserts to Supabase, and removes sold/deleted listings.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kpfmkkztgqjqokvfayca.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwZm1ra3p0Z3FqcW9rdmZheWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYxNTUzNiwiZXhwIjoyMDg2MTkxNTM2fQ.pXiYrnzwiPG6mMKF6J3y27UaiJHGC4iGq-LebxOga5Y'
const DISCOGS_KEY = process.env.DISCOGS_CONSUMER_KEY || 'JUdicElMPjcdYhSeiWPp'
const DISCOGS_SECRET = process.env.DISCOGS_CONSUMER_SECRET || 'dSyBJyhxYTzIyFUbHDCPsSzPCTGFCtRX'

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const HEADERS = {
  'User-Agent': 'RecycledRecordsLP/1.0 +https://recycledrecordslps.com',
  Authorization: `Discogs key=${DISCOGS_KEY}, secret=${DISCOGS_SECRET}`,
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

async function fetchInventoryPage(page: number) {
  const res = await fetch(
    `https://api.discogs.com/users/RecycledRecordsLp/inventory?status=For+Sale&per_page=100&page=${page}&sort=listed&sort_order=desc`,
    { headers: HEADERS }
  )
  if (!res.ok) throw new Error(`Discogs inventory page ${page}: HTTP ${res.status}`)
  return res.json()
}

async function fetchRelease(releaseId: number) {
  const res = await fetch(`https://api.discogs.com/releases/${releaseId}`, { headers: HEADERS })
  if (!res.ok) return null
  return res.json()
}

async function main() {
  log('Starting full Discogs → Supabase inventory sync...')

  // ── 1. Fetch all Discogs inventory pages ──────────────────────────────────
  const allListings: any[] = []
  let page = 1
  let totalPages = 1

    let fullSyncComplete = true // tracks whether ALL pages were fetched successfully

  do {
    log(`Fetching Discogs inventory page ${page}/${totalPages}...`)
    try {
      const data = await fetchInventoryPage(page)
      const listings = data.listings ?? []
      allListings.push(...listings)
      totalPages = data.pagination?.pages ?? 1
      log(`  Got ${listings.length} listings (total so far: ${allListings.length})`)
    } catch (e) {
      log(`  ERROR on page ${page}: ${e}`)
      log(`  ⚠️  Partial fetch — skipping stale deletion to protect inventory`)
      fullSyncComplete = false
      break
    }
    page++
    if (page <= totalPages) await sleep(1100) // ~54 req/min — under Discogs 60/min limit
  } while (page <= totalPages)

  log(`Total Discogs listings fetched: ${allListings.length}${fullSyncComplete ? '' : ' (INCOMPLETE)'}`)
  if (!fullSyncComplete) log(`Proceeding with upsert only — stale deletion SKIPPED for safety`)

  // ── 2. Load existing Supabase rows ────────────────────────────────────────
  log('Loading existing Supabase inventory...')
  const { data: existing, error: existingErr } = await sb
    .from('rr_inventory')
    .select('listing_id, release_id, genres, price, condition, sleeve_condition, notes')

  if (existingErr) {
    log(`ERROR loading existing: ${existingErr.message}`)
    process.exit(1)
  }

  const existingMap = new Map<number, { release_id: number; genres: string[]; price: number | null; condition: string | null; sleeve_condition: string | null; notes: string | null }>(
    (existing ?? []).map((r: any) => [r.listing_id, { release_id: r.release_id, genres: r.genres ?? [], price: r.price ?? null, condition: r.condition ?? null, sleeve_condition: r.sleeve_condition ?? null, notes: r.notes ?? null }])
  )
  log(`Existing in Supabase: ${existingMap.size}`)

  // ── 3. Fetch release details for new/genre-less listings ──────────────────
  const releaseCache = new Map<number, { genres: string[]; styles: string[] }>()
  const needsRelease = allListings.filter(l => {
    const ex = existingMap.get(l.id)
    return !ex || !ex.genres || ex.genres.length === 0
  })

  log(`Listings needing release details: ${needsRelease.length}`)
  let releaseCount = 0

  for (const listing of needsRelease) {
    const rId = listing.release.id
    if (releaseCache.has(rId)) continue

    try {
      const rd = await fetchRelease(rId)
      if (rd) {
        releaseCache.set(rId, { genres: rd.genres ?? [], styles: rd.styles ?? [] })
      } else {
        releaseCache.set(rId, { genres: [], styles: [] })
      }
    } catch (e) {
      log(`  Release ${rId} error: ${e}`)
      releaseCache.set(rId, { genres: [], styles: [] })
    }

    releaseCount++
    if (releaseCount % 10 === 0) {
      log(`  Fetched release details: ${releaseCount}/${needsRelease.length}`)
    }
    await sleep(1100)
  }

  log(`Release details fetched: ${releaseCache.size}`)

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

  // ── 5. Diff — only write rows that changed ────────────────────────────────
  const changedRows = rows.filter(r => {
    const ex = existingMap.get(r.listing_id)
    if (!ex) return true // new listing — always write
    // compare fields that change on Discogs
    return (
      r.price !== ex.price ||
      r.condition !== ex.condition ||
      r.sleeve_condition !== ex.sleeve_condition ||
      r.notes !== ex.notes
    )
  })

  const unchangedCount = rows.length - changedRows.length
  log(`Rows unchanged (skipping): ${unchangedCount}`)
  log(`Rows to write (new + changed): ${changedRows.length}`)

  // ── 6. Upsert only changed rows ───────────────────────────────────────────
  let addedCount = 0
  let updatedCount = 0
  let errorCount = 0

  for (let i = 0; i < changedRows.length; i += 100) {
    const batch = changedRows.slice(i, i + 100)
    const { error: upsertErr } = await sb.from('rr_inventory').upsert(batch, {
      onConflict: 'listing_id',
    })
    if (upsertErr) {
      log(`  Upsert batch ${i}-${i + batch.length} ERROR: ${upsertErr.message}`)
      errorCount += batch.length
    } else {
      batch.forEach(r => {
        if (existingMap.has(r.listing_id)) updatedCount++
        else addedCount++
      })
      if (batch.length > 0) log(`  Upserted batch ${i + 1}-${i + batch.length}`)
    }
  }

  // ── 7. Delete stale listings (ONLY if full sync completed) ──────────────
  let removedCount = 0

  if (fullSyncComplete) {
    const discogsIds = new Set(allListings.map(l => l.id))
    const staleIds = [...existingMap.keys()].filter(id => !discogsIds.has(id))

    log(`Stale listings to remove: ${staleIds.length}`)

    for (let i = 0; i < staleIds.length; i += 100) {
      const batch = staleIds.slice(i, i + 100)
      const { error: delErr } = await sb.from('rr_inventory').delete().in('listing_id', batch)
      if (!delErr) {
        removedCount += batch.length
        log(`  Deleted ${batch.length} stale listings`)
      } else {
        log(`  Delete error: ${delErr.message}`)
      }
    }
  } else {
    log(`Stale deletion SKIPPED — incomplete sync, inventory protected`)
  }

  // ── 8. Final report ───────────────────────────────────────────────────────
  const { count: finalCount } = await sb
    .from('rr_inventory')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'For Sale')

  log('═══════════════════════════════════════')
  log(`Sync complete!`)
  log(`  Added:   ${addedCount}`)
  log(`  Updated: ${updatedCount}`)
  log(`  Removed: ${removedCount}`)
  log(`  Errors:  ${errorCount}`)
  log(`  Total in Supabase: ${finalCount ?? '?'}`)
  log('═══════════════════════════════════════')
}

main().catch(e => {
  log(`FATAL: ${e}`)
  process.exit(1)
})
