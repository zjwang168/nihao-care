'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Role = 'family' | 'provider'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('family')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1) { setStep(2); return }

    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError
      if (!authData.user) throw new Error('No user returned')

      const { error: userError } = await supabase
        .from('users')
        .insert({ id: authData.user.id, email, role, preferred_lang: 'en' })
      if (userError) throw userError

      router.push('/onboarding')

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleRegister() {
    setGoogleLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setGoogleLoading(false)
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

          {/* Google登录只在第一步显示 */}
          {step === 1 && (
            <>
              <button
                onClick={handleGoogleRegister}
                disabled={googleLoading}
                className="w-full py-3 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50 mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {googleLoading ? 'Redirecting...' : 'Sign up with Google'}
                </span>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200"/>
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200"/>
              </div>
            </>
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