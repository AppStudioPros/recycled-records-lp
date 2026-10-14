'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const options = [
  { label: '7 Days', value: '7' },
  { label: '30 Days', value: '30' },
  { label: '1 Year', value: '365' },
]

export default function TrafficToggle({ current }: { current: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function select(val: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', val)
    router.push(`/admin/dashboard?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {options.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => select(value)}
          className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
          style={
            current === value
              ? { background: '#C4522A', color: '#fff' }
              : { color: '#6b7280' }
          }
        >
          {label}
        </button>
      ))}
    </div>
  )
}
