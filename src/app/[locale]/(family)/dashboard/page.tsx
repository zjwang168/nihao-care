'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function FamilyDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('family_profiles')
        .select('family_name')
        .eq('user_id', user.id)
        .single()

      if (data) setUserName(data.family_name)
      setLoading(false)
    }
    loadUser()
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

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">NiHao Care</span>
          <span className="text-xs bg-[#C8372D] text-white px-2 py-0.5 rounded">你好</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/search" className="text-sm text-gray-600 hover:text-gray-900">
            Find Caregivers
          </Link>
          <Link href="/messages" className="text-sm text-gray-600 hover:text-gray-900">
            Messages
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
            Welcome back, {userName} 👋
          </h1>
          <p className="text-gray-500 mt-1">Find the perfect caregiver for your family</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/search"
            className="bg-[#C8372D] text-white rounded-2xl p-6 hover:bg-[#E85045] transition-colors">
            <div className="text-3xl mb-3">🔍</div>
            <div className="font-semibold text-lg">Find a Caregiver</div>
            <div className="text-red-100 text-sm mt-1">Browse verified caregivers near you</div>
          </Link>

          <Link href="/messages"
            className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">💬</div>
            <div className="font-semibold text-lg text-gray-900">Messages</div>
            <div className="text-gray-500 text-sm mt-1">Chat with caregivers</div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Caregivers in DMV', value: '50+', icon: '👩‍👧' },
            { label: 'Avg response time', value: '< 2hr', icon: '⚡' },
            { label: 'Verified caregivers', value: '100%', icon: '✅' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">How NiHao Care works</h2>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Browse caregivers', desc: 'Filter by language, service type, and availability' },
              { step: '02', title: 'Send a message', desc: 'Connect directly with caregivers that match your needs' },
              { step: '03', title: 'Find your match', desc: 'Schedule an interview and start your care journey' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-4">
                <span className="text-xs font-bold text-[#C8372D] bg-red-50 px-2 py-1 rounded-full flex-shrink-0">
                  {item.step}
                </span>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <Link href="/search"
            className="mt-6 w-full block text-center py-3 bg-[#C8372D] text-white rounded-xl font-medium hover:bg-[#E85045] transition-colors">
            Start searching →
          </Link>
        </div>

      </div>
    </div>
  )
}