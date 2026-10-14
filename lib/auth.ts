import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'admin' | 'super_admin'

export interface RRUserProfile {
  id: string
  email: string
  display_name: string | null
  role: UserRole
  created_at: string
}

export async function getCurrentProfile(): Promise<RRUserProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('rr_user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data ?? null
}

export async function requireAuth(): Promise<RRUserProfile> {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/admin/login')
  return profile
}
