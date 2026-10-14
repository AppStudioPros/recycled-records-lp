import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { page, referrer, referrer_source, device_type, browser } = body

    if (!page) return NextResponse.json({ ok: true })

    const supabase = createAdminClient()
    await supabase.from('rr_page_views').insert({
      page,
      referrer: referrer ?? null,
      referrer_source: referrer_source ?? null,
      device_type: device_type ?? null,
      browser: browser ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Never error to the client
    return NextResponse.json({ ok: true })
  }
}
