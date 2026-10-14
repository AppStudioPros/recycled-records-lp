import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentProfile()
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (profile.role !== 'admin' && profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { display_name, role } = body

    const supabase = createAdminClient()

    // Fetch target user
    const { data: target, error: fetchError } = await supabase
      .from('rr_user_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Cannot edit super_admin users
    if (target.role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot edit super admin users' }, { status: 403 })
    }

    // Admins cannot change another admin's role (only super_admin can)
    if (
      profile.role === 'admin' &&
      role !== undefined &&
      target.role === 'admin' &&
      role !== target.role
    ) {
      return NextResponse.json(
        { error: 'Admins cannot change another admin\'s role' },
        { status: 403 }
      )
    }

    // Role must be user or admin (never super_admin)
    if (role !== undefined && !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const updates: Record<string, string> = {}
    if (display_name !== undefined) updates.display_name = display_name
    if (role !== undefined) updates.role = role

    const { error: updateError } = await supabase
      .from('rr_user_profiles')
      .update(updates)
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
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

    // Cannot delete yourself
    if (id === profile.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch target user
    const { data: target, error: fetchError } = await supabase
      .from('rr_user_profiles')
      .select('role')
      .eq('id', id)
      .single()

    if (fetchError || !target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Cannot delete super_admin
    if (target.role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot delete super admin users' }, { status: 403 })
    }

    // Delete from auth (cascades to profile via FK or we delete manually)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id)
    if (authDeleteError) {
      return NextResponse.json({ error: authDeleteError.message }, { status: 500 })
    }

    // Delete profile (in case no FK cascade)
    await supabase.from('rr_user_profiles').delete().eq('id', id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
