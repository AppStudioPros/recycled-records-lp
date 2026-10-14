import { requireRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import DashboardNav from '../DashboardNav'
import UsersManager, { type EnrichedUser } from '@/components/admin/UsersManager'

export default async function UsersPage() {
  const profile = await requireRole(['admin', 'super_admin'])
  const supabase = createAdminClient()

  // Get all profiles (filter out super_admin for non-super_admin callers)
  let query = supabase
    .from('rr_user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (profile.role !== 'super_admin') {
    query = query.neq('role', 'super_admin')
  }

  const { data: profiles } = await query

  // Get auth users for last_sign_in_at + email_confirmed_at
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

  const users: EnrichedUser[] = (profiles ?? []).map((p) => ({
    ...p,
    last_sign_in_at: authMap.get(p.id)?.last_sign_in_at ?? null,
    email_confirmed_at: authMap.get(p.id)?.email_confirmed_at ?? null,
  }))

  return (
    <div className="flex min-h-screen" style={{ background: '#FAF7F2' }}>
      <DashboardNav email={profile.email} role={profile.role} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <UsersManager
            users={users}
            currentUserId={profile.id}
            currentUserRole={profile.role}
          />
        </div>
      </main>
    </div>
  )
}
