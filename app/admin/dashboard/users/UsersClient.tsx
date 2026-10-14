'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  display_name: string | null
  role: string
  created_at: string
}

export default function UsersClient({ users }: { users: UserProfile[] }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [inviting, setInviting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setInviting(true)
    setMessage('')
    setError('')

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), display_name: displayName.trim() }),
    })

    const data = await res.json()
    setInviting(false)

    if (res.ok) {
      setMessage(`Invite sent to ${email}!`)
      setEmail('')
      setDisplayName('')
      router.refresh()
    } else {
      setError(data.error ?? 'Failed to send invite.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Users table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Team Members</h2>
        </div>
        {users.length === 0 ? (
          <div className="p-5 text-sm text-gray-400">No users yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Added</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 text-gray-800">{user.email}</td>
                  <td className="px-5 py-3 text-gray-500">{user.display_name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'super_admin'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      style={user.role === 'super_admin' ? { background: '#C4522A' } : {}}
                    >
                      {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4" style={{ color: '#C4522A' }} />
          Invite New User
        </h2>

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="colleague@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4522A] bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="First Last"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4522A] bg-white text-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={inviting}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: '#C4522A' }}
          >
            {inviting ? 'Sending…' : 'Send Invite'}
          </button>
        </form>
      </div>
    </div>
  )
}
