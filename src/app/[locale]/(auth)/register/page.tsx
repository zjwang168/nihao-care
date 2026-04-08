'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Role = 'family' | 'provider' | 'both'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('family')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1) { setStep(2); return }

    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (authError) throw authError
      if (!authData.user) throw new Error('No user returned')

      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          role,
          preferred_lang: 'en',
        })
      if (userError) throw userError

      router.push('/onboarding')

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-gray-900">NiHao Care</span>
            <span className="ml-2 text-xs bg-[#C8372D] text-white px-2 py-0.5 rounded">你好</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-[#C8372D]' : 'bg-gray-200'}`}/>
              <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-[#C8372D]' : 'bg-gray-200'}`}/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 1 ? 'Create your account' : 'I am a...'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1 ? 'Join NiHao Care for free' : 'This helps us personalize your experience'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password" required minLength={8} value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"
                    placeholder="At least 8 characters"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {[
                  { value: 'family', label: 'Family looking for care', emoji: '🏠', desc: 'Find nannies, tutors, and helpers' },
                  { value: 'provider', label: 'Caregiver looking for work', emoji: '👩‍👧', desc: 'Connect with families who need you' },
                  { value: 'both', label: 'Both', emoji: '🔄', desc: 'I need care and also provide care' },
                ].map(option => (
                  <button
                    key={option.value} type="button"
                    onClick={() => setRole(option.value as Role)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      role === option.value
                        ? 'border-[#C8372D] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                      {role === option.value && (
                        <div className="ml-auto w-5 h-5 bg-[#C8372D] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-[#C8372D] hover:bg-[#E85045] text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : step === 1 ? 'Continue →' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#C8372D] hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}