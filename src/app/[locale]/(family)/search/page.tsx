'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Provider = {
  id: string
  display_name: string
  bio: string
  avatar_url?: string
  service_types: string[]
  languages: string[]
  hourly_rate_min: number
  hourly_rate_max: number
  location_city: string
  location_state: string
  has_car: boolean
  has_drivers_license: boolean
  years_experience: number
  certifications?: {
    level: string
    bgc_status: string
    mvr_status: string
    ssn_verified: boolean
  }[]
}

const SERVICE_LABELS: Record<string, string> = {
  nanny: '👧 Nanny',
  babysitter: '🍼 Babysitter',
  tutor: '📚 Tutor',
  cook: '🍳 Cook',
  ayi: '🏠 阿姨',
}

const LANGUAGE_LABELS: Record<string, string> = {
  zh: '🇨🇳 Mandarin',
  en: '🇺🇸 English',
  es: '🇪🇸 Spanish',
  ko: '🇰🇷 Korean',
}

export default function SearchPage() {
  const router = useRouter()
  const supabase = createClient()

  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceFilter, setServiceFilter] = useState<string>('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [drivingOnly, setDrivingOnly] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      loadProviders()
    }
    checkAuth()
  }, [])

  async function loadProviders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (!error && data) setProviders(data)
    setLoading(false)
  }

  const filtered = providers.filter(p => {
    if (serviceFilter && !p.service_types.includes(serviceFilter)) return false
    if (verifiedOnly) {
      const cert = p.certifications?.[0]
      if (!cert || cert.level === 'none') return false
    }
    if (drivingOnly && !p.has_car) return false
    return true
  })

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">NiHao Care</span>
          <span className="text-xs bg-[#C8372D] text-white px-2 py-0.5 rounded">你好</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Find a Caregiver</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? 'Loading...' : `${filtered.length} caregivers available`}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setServiceFilter('')}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                serviceFilter === ''
                  ? 'bg-[#C8372D] text-white border-[#C8372D]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              All
            </button>
            {Object.entries(SERVICE_LABELS).map(([value, label]) => (
              <button key={value}
                onClick={() => setServiceFilter(value === serviceFilter ? '' : value)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  serviceFilter === value
                    ? 'bg-[#C8372D] text-white border-[#C8372D]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-200 hidden sm:block"/>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={verifiedOnly}
                onChange={e => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 accent-[#C8372D]"/>
              <span className="text-sm text-gray-600">Verified only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={drivingOnly}
                onChange={e => setDrivingOnly(e.target.checked)}
                className="w-4 h-4 accent-[#C8372D]"/>
              <span className="text-sm text-gray-600">Has car</span>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-6 h-6 border-2 border-[#C8372D] border-t-transparent rounded-full"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-gray-500">No caregivers found</div>
            <div className="text-gray-400 text-sm mt-1">Try adjusting your filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(provider => {
              const cert = provider.certifications?.[0]
              const isVerified = cert?.level !== 'none' && cert?.level
              const bgcCleared = cert?.bgc_status === 'cleared'
              const mvrCleared = cert?.mvr_status === 'cleared'

              return (
                <div key={provider.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">

                  <div className="flex items-start gap-3 mb-3">
                    {provider.avatar_url ? (
                      <img src={provider.avatar_url} alt={provider.display_name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"/>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C8372D] to-[#E8B84B] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {provider.display_name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{provider.display_name}</div>
                      <div className="text-sm text-gray-500">
                        {provider.location_city}, {provider.location_state}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-gray-900">
                        ${provider.hourly_rate_min}–${provider.hourly_rate_max}
                      </div>
                      <div className="text-xs text-gray-400">/hr</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {isVerified && (
                      <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium">
                        ✓ Verified
                      </span>
                    )}
                    {bgcCleared && (
                      <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">
                        ✓ BGC Cleared
                      </span>
                    )}
                    {mvrCleared && (
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                        ✓ MVR Cleared
                      </span>
                    )}
                    {provider.has_car && (
                      <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full">
                        🚗 Has car
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {provider.service_types.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-red-50 text-[#C8372D] rounded-full">
                        {SERVICE_LABELS[s] || s}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {provider.languages.map(l => (
                      <span key={l} className="text-xs px-2 py-0.5 border border-gray-200 text-gray-600 rounded-full">
                        {LANGUAGE_LABELS[l] || l}
                      </span>
                    ))}
                  </div>

                  {provider.bio && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{provider.bio}</p>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/provider/${provider.id}`}
                      className="flex-1 text-center py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-300 transition-colors">
                      View Profile
                    </Link>
                    <Link href={`/messages?provider=${provider.id}`}
                      className="flex-1 text-center py-2 bg-[#C8372D] text-white rounded-xl text-sm font-medium hover:bg-[#E85045] transition-colors">
                      Message
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}