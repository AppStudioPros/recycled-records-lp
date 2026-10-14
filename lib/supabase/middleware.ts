import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Public admin routes — no auth required
  const publicAdminPaths = [
    '/admin/login',
    '/admin/auth',
    '/admin/set-password',
  ]
  const isPublicAdmin = publicAdminPaths.some((p) => pathname.startsWith(p))

  // Only protect /admin/* routes
  if (!pathname.startsWith('/admin')) {
    return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isPublicAdmin) {
    // If user is already logged in and hits login, send to dashboard
    if (user && pathname === '/admin/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Protected admin route — redirect to login if not authenticated
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // Role-based protection for /admin/dashboard/users*
  if (pathname.startsWith('/admin/dashboard/users')) {
    const { data: profile } = await supabase
      .from('rr_user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    if (role !== 'admin' && role !== 'super_admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
