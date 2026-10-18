import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { runInventorySync } from '@/lib/sync-inventory'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runInventorySync({
      maxPages: 999,
      fetchReleaseDetails: true,
      deleteStale: true,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
