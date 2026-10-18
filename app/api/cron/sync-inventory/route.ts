import { NextResponse } from 'next/server'
import { runInventorySync } from '@/lib/sync-inventory'

export const runtime = 'nodejs'
export const maxDuration = 300

// Vercel cron job — runs nightly at 2 AM UTC
// Called as a GET by Vercel's cron scheduler
export async function GET(req: Request) {
  // Verify Vercel cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runInventorySync({
      maxPages: 999,
      fetchReleaseDetails: true,
      deleteStale: true,
    })

    console.log('[cron:sync-inventory]', result)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('[cron:sync-inventory] error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
