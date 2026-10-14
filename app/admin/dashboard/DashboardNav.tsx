'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, FileText, PlusCircle, Users, LogOut, Disc } from 'lucide-react'

const baseNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/admin/dashboard/posts', label: 'Posts', icon: FileText, adminOnly: false },
  { href: '/admin/dashboard/new', label: 'New Post', icon: PlusCircle, adminOnly: false },
  { href: '/admin/dashboard/users', label: 'Users', icon: Users, adminOnly: true },
]

export default function DashboardNav({
  email,
  role,
}: {
  email: string
  role?: string
}) {
  const pathname = usePathname()
  const router = useRouter()

  const isAdmin = role === 'admin' || role === 'super_admin'
  const navItems = baseNavItems.filter((item) => !item.adminOnly || isAdmin)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen flex flex-col flex-shrink-0" style={{ background: '#3d1f0f' }}>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#C4522A' }}
          >
            <Disc className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Recycled Records LP</div>
            <div className="text-white/40 text-xs">Admin</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/admin/dashboard'
              ? pathname === '/admin/dashboard'
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              style={isActive ? { background: '#C4522A' } : {}}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + Sign out */}
      <div className="p-4 border-t border-white/10">
        <div className="text-white/40 text-xs mb-3 truncate">{email}</div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
