import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import DashboardNav from '../DashboardNav'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const profile = await requireAuth()
  const supabase = createAdminClient()

  const { data: users } = await supabase
    .from('rr_user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen">
      <DashboardNav email={profile.email} />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>
          <UsersClient users={users ?? []} />
        </div>
      </main>
    </div>
  )
}
