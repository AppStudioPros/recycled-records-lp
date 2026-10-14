import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import DashboardNav from './DashboardNav'
import { FileText, Eye, BarChart2 } from 'lucide-react'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-700 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function ProgressBar({ pct, color = '#C4522A' }: { pct: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  )
}

export default async function DashboardPage() {
  const profile = await requireAuth()
  const supabase = createAdminClient()

  // Blog stats
  const { data: posts } = await supabase
    .from('rr_blog_posts')
    .select('id, title, slug, status, published_at, created_at')
    .order('created_at', { ascending: false })

  const totalPosts = posts?.length ?? 0
  const publishedCount = posts?.filter((p) => p.status === 'published').length ?? 0
  const draftCount = posts?.filter((p) => p.status === 'draft').length ?? 0
  const recentPosts = posts?.slice(0, 5) ?? []

  // Traffic stats (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: allViews } = await supabase
    .from('rr_page_views')
    .select('id, page, referrer_source, device_type, created_at')

  const { data: recentViews } = await supabase
    .from('rr_page_views')
    .select('id, page, referrer_source, device_type')
    .gte('created_at', thirtyDaysAgo.toISOString())

  const totalAllTime = allViews?.length ?? 0
  const totalLast30 = recentViews?.length ?? 0

  // Device breakdown
  const deviceCounts: Record<string, number> = {}
  recentViews?.forEach((v) => {
    const d = v.device_type ?? 'unknown'
    deviceCounts[d] = (deviceCounts[d] ?? 0) + 1
  })

  // Referrer breakdown
  const referrerCounts: Record<string, number> = {}
  recentViews?.forEach((v) => {
    const r = v.referrer_source ?? 'direct'
    referrerCounts[r] = (referrerCounts[r] ?? 0) + 1
  })
  const sortedReferrers = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1])

  // Top pages
  const pageCounts: Record<string, number> = {}
  recentViews?.forEach((v) => {
    pageCounts[v.page] = (pageCounts[v.page] ?? 0) + 1
  })
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const devices = ['mobile', 'tablet', 'desktop']
  const deviceColors: Record<string, string> = {
    mobile: '#C4522A',
    tablet: '#E8845A',
    desktop: '#F5B89A',
  }

  return (
    <div className="flex min-h-screen">
      <DashboardNav email={profile.email} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm mb-8">
            Welcome back, {profile.display_name ?? profile.email}
          </p>

          {/* Blog Stats */}
          <section className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Blog
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard label="Total Posts" value={totalPosts} />
              <StatCard label="Published" value={publishedCount} />
              <StatCard label="Drafts" value={draftCount} />
            </div>

            {/* Recent posts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">Recent Posts</h3>
              </div>
              {recentPosts.length === 0 ? (
                <div className="p-5 text-sm text-gray-400">No posts yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {recentPosts.map((post) => (
                      <tr key={post.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-5 py-3 font-medium text-gray-800">{post.title}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              post.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">
                          {new Date(post.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Traffic */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Traffic (Last 30 Days)
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard label="Visits (Last 30 Days)" value={totalLast30.toLocaleString()} />
              <StatCard label="Total Visits (All Time)" value={totalAllTime.toLocaleString()} />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Device breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#C4522A]" /> Device Breakdown
                </h3>
                {totalLast30 === 0 ? (
                  <p className="text-gray-400 text-sm">No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {devices.map((d) => {
                      const count = deviceCounts[d] ?? 0
                      const pct = totalLast30 > 0 ? Math.round((count / totalLast30) * 100) : 0
                      return (
                        <div key={d}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize text-gray-700">{d}</span>
                            <span className="text-gray-500">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <ProgressBar pct={pct} color={deviceColors[d]} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Referrer sources */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">Referrer Sources</h3>
                {sortedReferrers.length === 0 ? (
                  <p className="text-gray-400 text-sm">No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sortedReferrers.slice(0, 6).map(([source, count]) => {
                      const pct = totalLast30 > 0 ? Math.round((count / totalLast30) * 100) : 0
                      return (
                        <div key={source}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize text-gray-700">{source}</span>
                            <span className="text-gray-500">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <ProgressBar pct={pct} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">Top Pages</h3>
              </div>
              {topPages.length === 0 ? (
                <div className="p-5 text-sm text-gray-400">No page data yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Page
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                        Views
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                        Share
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.map(([page, count]) => {
                      const pct = totalLast30 > 0 ? Math.round((count / totalLast30) * 100) : 0
                      return (
                        <tr key={page} className="border-b border-gray-50 last:border-0">
                          <td className="px-5 py-3 text-gray-800 font-mono text-xs">{page}</td>
                          <td className="px-5 py-3 text-gray-600 text-right">{count}</td>
                          <td className="px-5 py-3 text-gray-400 text-right text-xs">{pct}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
