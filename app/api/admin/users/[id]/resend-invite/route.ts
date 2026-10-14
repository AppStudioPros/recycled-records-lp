import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { Resend } from 'resend'
import { inviteEmailHtml } from '@/lib/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentProfile()
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (profile.role !== 'admin' && profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    // Fetch target profile
    const { data: target, error: fetchError } = await supabase
      .from('rr_user_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (target.role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot resend invite to super admin' }, { status: 403 })
    }

    // Generate a new invite link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: target.email,
      options: {
        redirectTo: 'https://recycledrecordslps.com/admin/set-password',
      },
    })

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 })
    }

    const inviteLink = linkData?.properties?.action_link
    if (!inviteLink) {
      return NextResponse.json({ error: 'Failed to generate invite link' }, { status: 500 })
    }

    await resend.emails.send({
      from: 'Recycled Records LP <noreply@mail.recycledrecordslps.com>',
      to: target.email,
      subject: "You've been invited to the Recycled Records LP team",
      html: inviteEmailHtml({
        displayName: target.display_name ?? target.email,
        role: target.role,
        inviteLink,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
