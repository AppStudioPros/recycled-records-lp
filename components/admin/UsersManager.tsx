'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Edit2, X, Check, RefreshCw, Key, Trash2, ChevronDown } from 'lucide-react'

export interface EnrichedUser {
  id: string
  email: string
  display_name: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
}

interface Props {
  users: EnrichedUser[]
  currentUserId: string
  currentUserRole: string
}

function statusFor(user: EnrichedUser): 'Invited' | 'Active' {
  if (!user.email_confirmed_at || !user.last_sign_in_at) return 'Invited'
  return 'Active'
}

function StatusBadge({ status }: { status: 'Invited' | 'Active' }) {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
      Invited
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'admin') {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
        style={{ background: '#C4522A' }}
      >
        Admin
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
      User
    </span>
  )
}

export default function UsersManager({ users: initialUsers, currentUserId, currentUserRole }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState<EnrichedUser[]>(initialUsers)

  // Invite form state
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteDisplayName, setInviteDisplayName] = useState('')
  const [inviteRole, setInviteRole] = useState<'user' | 'admin'>('user')
  const [inviting, setInviting] = useState(false)
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteError, setInviteError] = useState('')

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user')
  const [saving, setSaving] = useState(false)

  // Action loading states
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [actionMessages, setActionMessages] = useState<Record<string, string>>({})

  function setActionMsg(id: string, msg: string) {
    setActionMessages((prev) => ({ ...prev, [id]: msg }))
    setTimeout(() => setActionMessages((prev) => { const n = { ...prev }; delete n[id]; return n }), 4000)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteMessage('')
    setInviteError('')

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: inviteEmail.trim(),
        display_name: inviteDisplayName.trim() || null,
        role: inviteRole,
      }),
    })

    const data = await res.json()
    setInviting(false)

    if (res.ok) {
      setInviteMessage(`Invite sent to ${inviteEmail}!`)
      setInviteEmail('')
      setInviteDisplayName('')
      setInviteRole('user')
      router.refresh()
      // Reload user list
      const listRes = await fetch('/api/admin/users')
      if (listRes.ok) setUsers(await listRes.json())
    } else {
      setInviteError(data.error ?? 'Failed to send invite.')
    }
  }

  function startEdit(user: EnrichedUser) {
    setEditingId(user.id)
    setEditDisplayName(user.display_name ?? '')
    setEditRole(user.role === 'admin' ? 'admin' : 'user')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(userId: string) {
    setSaving(true)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: editDisplayName, role: editRole }),
    })
    const data = await res.json()
    setSaving(false)

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, display_name: editDisplayName, role: editRole } : u
        )
      )
      setEditingId(null)
    } else {
      alert(data.error ?? 'Failed to save changes.')
    }
  }

  async function handleResendInvite(userId: string) {
    setLoadingAction(`resend-${userId}`)
    const res = await fetch(`/api/admin/users/${userId}/resend-invite`, { method: 'POST' })
    const data = await res.json()
    setLoadingAction(null)
    if (res.ok) {
      setActionMsg(userId, '✓ Invite resent')
    } else {
      alert(data.error ?? 'Failed to resend invite.')
    }
  }

  async function handleResetPassword(userId: string) {
    setLoadingAction(`reset-${userId}`)
    const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: 'POST' })
    const data = await res.json()
    setLoadingAction(null)
    if (res.ok) {
      setActionMsg(userId, '✓ Reset email sent')
    } else {
      alert(data.error ?? 'Failed to send reset email.')
    }
  }

  async function handleDelete(user: EnrichedUser) {
    if (!confirm(`Delete ${user.display_name ?? user.email}? This cannot be undone.`)) return
    setLoadingAction(`delete-${user.id}`)
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    const data = await res.json()
    setLoadingAction(null)
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } else {
      alert(data.error ?? 'Failed to delete user.')
    }
  }

  const canChangeRole = (target: EnrichedUser) => {
    // Admins cannot change another admin's role
    if (currentUserRole === 'admin' && target.role === 'admin') return false
    return true
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your team members and their access.</p>
        </div>
        <button
          onClick={() => {
            setShowInviteForm(!showInviteForm)
            setInviteMessage('')
            setInviteError('')
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#C4522A' }}
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Invite a new team member</h2>
            <button
              onClick={() => setShowInviteForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {inviteMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {inviteMessage}
            </div>
          )}
          {inviteError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {inviteError}
            </div>
          )}

          <form onSubmit={handleInvite} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email *</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                placeholder="colleague@example.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4522A] text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Display Name</label>
              <input
                type="text"
                value={inviteDisplayName}
                onChange={(e) => setInviteDisplayName(e.target.value)}
                placeholder="First Last"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4522A] text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Role</label>
              <div className="relative">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'user' | 'admin')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4522A] text-sm text-gray-900 appearance-none bg-white pr-8"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={inviting}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: '#C4522A' }}
              >
                {inviting ? 'Sending…' : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No team members yet. Invite someone above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#FAF7F2' }}>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Display Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const status = statusFor(user)
                  const isEditing = editingId === user.id
                  const isMe = user.id === currentUserId
                  const actionKey = user.id

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      {/* Display Name */}
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDisplayName}
                            onChange={(e) => setEditDisplayName(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4522A] text-sm text-gray-900"
                            placeholder="Display name"
                          />
                        ) : (
                          <span className="font-medium text-gray-800">
                            {user.display_name ?? <span className="text-gray-400 italic">—</span>}
                            {isMe && (
                              <span className="ml-2 text-xs text-gray-400">(you)</span>
                            )}
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3 text-gray-600">{user.email}</td>

                      {/* Role */}
                      <td className="px-5 py-3">
                        {isEditing && canChangeRole(user) ? (
                          <div className="relative">
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value as 'user' | 'admin')}
                              className="px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4522A] text-sm text-gray-900 appearance-none bg-white pr-7"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                          </div>
                        ) : (
                          <RoleBadge role={user.role} />
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <StatusBadge status={status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {actionMessages[actionKey] && (
                            <span className="text-xs text-green-600 font-medium mr-1">
                              {actionMessages[actionKey]}
                            </span>
                          )}

                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(user.id)}
                                disabled={saving}
                                title="Save"
                                className="p-1.5 rounded-md text-green-600 hover:bg-green-50 disabled:opacity-50 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                title="Cancel"
                                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Edit */}
                              <button
                                onClick={() => startEdit(user)}
                                title="Edit"
                                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Resend Invite — only if Invited */}
                              {status === 'Invited' && (
                                <button
                                  onClick={() => handleResendInvite(user.id)}
                                  disabled={loadingAction === `resend-${user.id}`}
                                  title="Resend Invite"
                                  className="p-1.5 rounded-md text-amber-500 hover:text-amber-700 hover:bg-amber-50 disabled:opacity-50 transition-colors"
                                >
                                  <RefreshCw className={`w-4 h-4 ${loadingAction === `resend-${user.id}` ? 'animate-spin' : ''}`} />
                                </button>
                              )}

                              {/* Reset Password — only if Active */}
                              {status === 'Active' && (
                                <button
                                  onClick={() => handleResetPassword(user.id)}
                                  disabled={loadingAction === `reset-${user.id}`}
                                  title="Reset Password"
                                  className="p-1.5 rounded-md text-blue-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                                >
                                  <Key className={`w-4 h-4 ${loadingAction === `reset-${user.id}` ? 'animate-spin' : ''}`} />
                                </button>
                              )}

                              {/* Delete — not yourself */}
                              {!isMe && (
                                <button
                                  onClick={() => handleDelete(user)}
                                  disabled={loadingAction === `delete-${user.id}`}
                                  title="Delete"
                                  className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
