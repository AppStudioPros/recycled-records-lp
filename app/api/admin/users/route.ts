import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    await requireAuth()
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('rr_user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const { email, display_name } = await request.json()

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const supabase = createAdminClient()

    // Generate invite link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/set-password` },
    })

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 })
    }

    const inviteLink = linkData?.properties?.action_link

    // Insert profile
    if (linkData?.user?.id) {
      await supabase.from('rr_user_profiles').upsert({
        id: linkData.user.id,
        email,
        display_name: display_name ?? null,
        role: 'admin',
      })
    }

    // Send invite email via Resend
    await resend.emails.send({
      from: 'Recycled Records LP <noreply@mail.recycledrecordslps.com>',
      to: email,
      subject: 'You\'re invited to the Recycled Records LP admin panel',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #C4522A;">You're invited!</h2>
          <p>Hi ${display_name ?? 'there'},</p>
          <p>You've been invited to manage the Recycled Records LP website. Click the button below to set your password and get started.</p>
          <a href="${inviteLink}" style="display:inline-block;background:#C4522A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
            Accept Invite
          </a>
          <p style="color:#888;font-size:13px;">This link expires in 24 hours. If you didn't expect this email, you can ignore it.</p>
          <p style="color:#888;font-size:13px;">— Recycled Records LP</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
