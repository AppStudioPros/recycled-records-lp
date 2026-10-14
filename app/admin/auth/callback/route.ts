import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'invite' | 'recovery' | 'magiclink' | null

  const supabase = await createClient()

  // Handle invite / magic link flow (token_hash + type)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return NextResponse.redirect(`${origin}/admin/set-password`)
    }
    return NextResponse.redirect(`${origin}/admin/login?error=invite_expired`)
  }

  // Handle PKCE flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/admin/set-password`)
    }
    return NextResponse.redirect(`${origin}/admin/login?error=invite_expired`)
  }

  return NextResponse.redirect(`${origin}/admin/login?error=invite_expired`)
}
