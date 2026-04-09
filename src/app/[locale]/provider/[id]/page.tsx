'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Provider = {
  id: string
  display_name: string
  bio: string
  service_types: string[]
  languages: string[]
  hourly_rate_min: number
  hourly_rate_max: number
  location_city: string
  location_state: string
  has_car: boolean
  has_drivers_license: boolean
  years_experience: number
  cooking_styles: string[]
}

const SERVICE_LABELS: Record<string, string> = {
  nanny: '👧 Nanny', babysitter: '🍼 Babysitter',
  tutor: '📚 Tutor', cook: '🍳 Cook', ayi: '🏠 阿姨',
}

const LANGUAGE_LABELS: Record<string, string> = {
  zh: '🇨🇳 Mandarin', en: '🇺🇸 English',
  es: '🇪🇸 Spanish', ko: '🇰🇷 Korean',
}

export default function ProviderProfilePage() {
  const params = useParams()
  const supabase = createClient()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      const { data } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (data) setProvider(data)
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-[#C8372D] border-t-transparent rounded-full"/>
    </div>
  )

  if (!provider) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">😕</div>
        <div className="text-gray-500">Profile not found</div>
        <Link href="/search" className="mt-4 inline-block text-[#C8372D] hover:underline">
          ← Back to search
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">NiHao Care</span>
          <span className="text-xs bg-[#C8372D] text-white px-2 py-0.5 rounded">你好</span>
        </Link>
        <Link href="/search" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to search
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C8372D] to-[#E8B84B] flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              {provider.display_name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {provider.display_name}
              </h1>
              <div className="text-gray-500 mb-3">
                📍 {provider.location_city}, {provider.location_state}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {provider.service_types.map(s => (
                  <span key={s} className="text-sm px-3 py-1 bg-red-50 text-[#C8372D] rounded-full">
                    {SERVICE_LABELS[s] || s}
                  </span>
                ))}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${provider.hourly_rate_min}–${provider.hourly_rate_max}
                <span className="text-sm font-normal text-gray-400">/hr</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            {isLoggedIn ? (
              <Link href={`/messages?provider=${provider.id}`}
                className="flex-1 text-center py-3 bg-[#C8372D] text-white font-medium rounded-xl hover:bg-[#E85045] transition-colors">
                💬 Send Message
              </Link>
            ) : (
              <Link href="/register"
                className="flex-1 text-center py-3 bg-[#C8372D] text-white font-medium rounded-xl hover:bg-[#E85045] transition-colors">
                Sign up to message
              </Link>
            )}
            <Link href="/search"
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 transition-colors">
              ← Search
            </Link>
          </div>
        </div>

        {provider.bio && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">{provider.bio}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
          <div className="grid grid-cols-2 gap-4">

            <div className="flex items-center gap-3">
              <span className="text-xl">🗣️</span>
              <div>
                <div className="text-xs text-gray-400">Languages</div>
                <div className="text-sm font-medium text-gray-900">
                  {provider.languages.map(l => LANGUAGE_LABELS[l] || l).join(' · ')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xl">⏱️</span>
              <div>
                <div className="text-xs text-gray-400">Experience</div>
                <div className="text-sm font-medium text-gray-900">
                  {provider.years_experience} years
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xl">🚗</span>
              <div>
                <div className="text-xs text-gray-400">Transportation</div>
                <div className="text-sm font-medium text-gray-900">
                  {provider.has_car ? 'Has own car' : 'No car'}
                  {provider.has_drivers_license ? ' · Licensed' : ''}
                </div>
              </div>
            </div>

            {provider.cooking_styles?.length > 0 && (
              <div className="flex items-center gap-3 col-span-2">
                <span className="text-xl">🍳</span>
                <div>
                  <div className="text-xs text-gray-400">Cooking styles</div>
                  <div className="text-sm font-medium text-gray-900">
                    {provider.cooking_styles.join(' · ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!isLoggedIn && (
          <div className="bg-[#C8372D] rounded-2xl p-6 text-center text-white">
            <div className="text-lg font-semibold mb-2">
              Interested in {provider.display_name}?
            </div>
            <div className="text-red-100 text-sm mb-4">
              Sign up free to send a message and connect
            </div>
            <Link href="/register"
              className="inline-block px-6 py-2.5 bg-white text-[#C8372D] font-semibold rounded-full hover:shadow-lg transition-all">
              Join Free →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}