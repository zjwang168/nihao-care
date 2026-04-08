'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type ProviderProfile = {
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
  profile_complete: number
}

export default function ProviderDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<ProviderProfile | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profileData } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)

        // Get unread messages count
        const { data: convs } = await supabase
          .from('conversations')
          .select('provider_unread')
          .eq('provider_id', profileData.id)

        if (convs) {
          const total = convs.reduce((sum, c) => sum + (c.provider_unread || 0), 0)
          setUnreadCount(total)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-[#C8372D] border-t-transparent rounded-full"/>
    </div>
  )

  const SERVICE_LABELS: Record<string, string> = {
    nanny: '👧 Nanny', babysitter: '🍼 Babysitter',
    tutor: '📚 Tutor', cook: '🍳 Cook', ayi: '🏠 阿姨',
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">NiHao Care</span>
          <span className="text-xs bg-[#C8372D] text-white px-2 py-0.5 rounded">你好</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/provider/messages" className="text-sm text-gray-600 hover:text-gray-900 relative">
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-3 w-4 h-4 bg-[#C8372D] text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link href="/provider/profile" className="text-sm text-gray-600 hover:text-gray-900">
            My Profile
          </Link>
          <button onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.display_name} 👋
          </h1>
          <p className="text-gray-500 mt-1">Manage your caregiver profile</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/provider/messages"
            className="bg-[#C8372D] text-white rounded-2xl p-6 hover:bg-[#E85045] transition-colors relative">
            <div className="text-3xl mb-3">💬</div>
            <div className="font-semibold text-lg">Messages</div>
            <div className="text-red-100 text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'Chat with families'}
            </div>
            {unreadCount > 0 && (
              <span className="absolute top-4 right-4 w-6 h-6 bg-white text-[#C8372D] text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link href="/provider/profile"
            className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">👤</div>
            <div className="font-semibold text-lg text-gray-900">My Profile</div>
            <div className="text-gray-500 text-sm mt-1">Edit your info and services</div>
          </Link>
        </div>

        {/* Profile summary */}
        {profile && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-semibold text-gray-900">Your Profile</h2>
              <Link href="/provider/profile"
                className="text-sm text-[#C8372D] hover:underline">
                Edit →
              </Link>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C8372D] to-[#E8B84B] flex items-center justify-center text-white font-bold text-xl">
                {profile.display_name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{profile.display_name}</div>
                <div className="text-sm text-gray-500">{profile.location_city}, {profile.location_state}</div>
                <div className="text-sm text-gray-500">${profile.hourly_rate_min}–${profile.hourly_rate_max}/hr</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {profile.service_types.map(s => (
                <span key={s} className="text-xs px-2 py-1 bg-red-50 text-[#C8372D] rounded-full">
                  {SERVICE_LABELS[s] || s}
                </span>
              ))}
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-500 line-clamp-2">{profile.bio}</p>
            )}
          </div>
        )}

        {/* Get certified CTA */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🏅</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">Get Certified — Get More Matches</div>
              <div className="text-sm text-gray-600 mb-3">
                Verified caregivers appear higher in search results and get 3x more inquiries.
                Background check starts at $35.
              </div>
              <Link href="/provider/certifications"
                className="inline-block px-4 py-2 bg-amber-500 text-white text-sm rounded-xl hover:bg-amber-600 transition-colors font-medium">
                Get Certified →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}