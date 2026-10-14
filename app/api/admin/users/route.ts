import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { Resend } from 'resend'
import { inviteEmailHtml } from '@/lib/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const profile = await getCurrentProfile()
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminClient()

    // Get all profiles
    let query = supabase
      .from('rr_user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // Non-super_admin callers never see super_admin rows
    if (profile.role !== 'super_admin') {
      query = query.neq('role', 'super_admin')
    }

    const { data: profiles, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Get auth users for last_sign_in_at and email_confirmed_at
    const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const authMap = new Map(
      (authData?.users ?? []).map((u) => [
        u.id,
        {
          last_sign_in_at: u.last_sign_in_at ?? null,
          email_confirmed_at: u.email_confirmed_at ?? null,
        },
      ])
    )

    const enriched = (profiles ?? []).map((p) => ({
      ...p,
      last_sign_in_at: authMap.get(p.id)?.last_sign_in_at ?? null,
      email_confirmed_at: authMap.get(p.id)?.email_confirmed_at ?? null,
    }))

    return NextResponse.json(enriched)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile()
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (profile.role !== 'admin' && profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, display_name, role } = await request.json()

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Role must be user or admin' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Generate invite link with 7-day expiry
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        redirectTo: 'https://recycledrecordslps.com/admin/set-password',
        data: { display_name, role },
      },
    })

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 })
    }

    const inviteLink = linkData?.properties?.action_link
    if (!inviteLink) {
      return NextResponse.json({ error: 'Failed to generate invite link' }, { status: 500 })
    }

    // Insert profile
    if (linkData?.user?.id) {
      const { error: profileError } = await supabase.from('rr_user_profiles').upsert({
        id: linkData.user.id,
        email,
        display_name: display_name ?? null,
        role,
      })
      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }
    }

    // Send branded invite email via Resend
    await resend.emails.send({
      from: 'Recycled Records LP <noreply@mail.recycledrecordslps.com>',
      to: email,
      subject: "You've been invited to the Recycled Records LP team",
      html: inviteEmailHtml({
        displayName: display_name ?? email,
        role,
        inviteLink,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
