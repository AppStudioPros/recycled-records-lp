'use client'
import { useState, useEffect } from 'react'
import { RefreshCw, Database } from 'lucide-react'

interface SyncMeta {
  totalSupabase: number | null
  lastSynced: string | null
}

export default function SyncInventoryCard() {
  const [meta, setMeta] = useState<SyncMeta>({ totalSupabase: null, lastSynced: null })
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  // Fetch meta on mount
  useEffect(() => {
    fetchMeta()
  }, [])

  async function fetchMeta() {
    try {
      // Use the listings API with head to get count
      const res = await fetch('/api/shop/listings?per_page=1&page=1')
      if (!res.ok) return
      const data = await res.json()
      setMeta({
        totalSupabase: data.total ?? 0,
        lastSynced: null, // will fetch separately
      })

      // Get last_synced from meta endpoint
      const metaRes = await fetch('/api/admin/inventory-meta')
      if (metaRes.ok) {
        const metaData = await metaRes.json()
        setMeta(prev => ({ ...prev, lastSynced: metaData.lastSynced ?? null }))
      }
    } catch { /* ignore */ }
  }

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/admin/sync-inventory', { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        setSyncResult(`Error: ${data.error}`)
      } else {
        setSyncResult(
          `Done! Added ${data.added ?? 0}, updated ${data.updated ?? 0}, removed ${data.removed ?? 0}. Total: ${data.totalSupabase ?? '?'}`
        )
        setMeta({
          totalSupabase: data.totalSupabase ?? null,
          lastSynced: new Date().toISOString(),
        })
      }
    } catch (e) {
      setSyncResult(`Error: ${e}`)
    } finally {
      setSyncing(false)
    }
  }

  const lastSyncedDisplay = meta.lastSynced
    ? new Date(meta.lastSynced).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Never'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
        <Database className="w-4 h-4" /> Inventory Sync
      </h2>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-6">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {meta.totalSupabase != null ? meta.totalSupabase.toLocaleString() : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Records in database</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-700">{lastSyncedDisplay}</div>
            <div className="text-xs text-gray-500 mt-0.5">Last synced</div>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{
            backgroundColor: syncing ? '#9a3f1e' : '#C4522A',
            cursor: syncing ? 'wait' : 'pointer',
            border: 'none',
            opacity: syncing ? 0.8 : 1,
          }}
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing…' : 'Sync Now'}
        </button>
      </div>

      {syncResult && (
        <p className={`mt-3 text-xs font-medium ${syncResult.startsWith('Error') ? 'text-red-600' : 'text-green-700'}`}>
          {syncResult}
        </p>
      )}

      <p className="text-xs text-gray-400 mt-3">
        Pulls latest inventory from Discogs and updates the Supabase database. The nightly cron job runs at 2 AM UTC.
      </p>
    </div>
  )
}
