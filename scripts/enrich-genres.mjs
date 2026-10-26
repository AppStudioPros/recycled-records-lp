// Genre enrichment script — hits Discogs release API for each listing, stores genres in Supabase
// Run: node scripts/enrich-genres.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kpfmkkztgqjqokvfayca.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwZm1ra3p0Z3FqcW9rdmZheWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYxNTUzNiwiZXhwIjoyMDg2MTkxNTM2fQ.pXiYrnzwiPG6mMKF6J3y27UaiJHGC4iGq-LebxOga5Y'
const DISCOGS_KEY = 'JUdicElMPjcdYhSeiWPp'
const DISCOGS_SECRET = 'dSyBJyhxYTzIyFUbHDCPsSzPCTGFCtRX'

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function main() {
  console.log('Fetching rows with empty genres...')

  // Get all rows missing genre data
  const { data: rows, error } = await sb
    .from('rr_inventory')
    .select('listing_id, release_id')
    .or('genres.is.null,genres.eq.{}')
    .not('release_id', 'is', null)
    .limit(5000)
    .order('listing_id')

  if (error) { console.error('Supabase fetch error:', error); process.exit(1) }
  console.log(`Found ${rows.length} records to enrich`)

  let done = 0
  let skipped = 0
  let failed = 0

  for (const row of rows) {
    try {
      const url = `https://api.discogs.com/releases/${row.release_id}`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'RecycledRecordsLP/1.0 +https://recycledrecordslps.com',
          Authorization: `Discogs key=${DISCOGS_KEY}, secret=${DISCOGS_SECRET}`,
        },
      })

      if (res.status === 404) { skipped++; await sleep(1100); continue }
      if (!res.ok) { failed++; console.warn(`  ⚠ ${row.release_id} → HTTP ${res.status}`); await sleep(1100); continue }

      const data = await res.json()
      const genres = [...(data.genres ?? []), ...(data.styles ?? [])]

      if (genres.length > 0) {
        const { error: upsertErr } = await sb
          .from('rr_inventory')
          .update({ genres })
          .eq('listing_id', row.listing_id)
        if (upsertErr) console.warn(`  ⚠ DB update failed for ${row.id}:`, upsertErr.message)
      }

      done++
      if (done % 100 === 0) {
        console.log(`  ✅ ${done} enriched | ${skipped} skipped | ${failed} failed | ${rows.length - done - skipped - failed} remaining`)
      }
    } catch (e) {
      failed++
      console.warn(`  ⚠ Exception on ${row.release_id}:`, e.message)
    }

    await sleep(1100) // ~54/min, safely under 60/min rate limit
  }

  console.log(`\nDone! ${done} enriched | ${skipped} skipped (404) | ${failed} failed`)
}

main()
