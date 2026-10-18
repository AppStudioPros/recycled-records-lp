import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('rr_inventory')
    .select('last_synced')
    .order('last_synced', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    lastSynced: data?.last_synced ?? null,
  })
}
