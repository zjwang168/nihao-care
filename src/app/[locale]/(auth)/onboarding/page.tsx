'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Step = 'family_info' | 'provider_info'

// Zip code lookup function
async function lookupZipCode(zip: string): Promise<{ city: string; state: string } | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`)
    if (!res.ok) return null
    const data = await res.json()
    return {
      city: data.places[0]['place name'],
      state: data.places[0]['state abbreviation'],
    }
  } catch {
    return null
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<'family' | 'provider' | null>(null)
  const [step, setStep] = useState<Step>('family_info')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')

  // Family fields
  const [familyName, setFamilyName] = useState('')
  const [familyZip, setFamilyZip] = useState('')
  const [familyCity, setFamilyCity] = useState('')
  const [familyState, setFamilyState] = useState('')
  const [familyZipLoading, setFamilyZipLoading] = useState(false)
  const [familyZipError, setFamilyZipError] = useState('')
  const [childrenAges, setChildrenAges] = useState('')
  const [languageGoals, setLanguageGoals] = useState<string[]>(['zh'])
  const [needsDriving, setNeedsDriving] = useState(false)
  const [needsCooking, setNeedsCooking] = useState(false)

  // Provider fields
  const [displayName, setDisplayName] = useState('')
  const [providerZip, setProviderZip] = useState('')
  const [providerCity, setProviderCity] = useState('')
  const [providerState, setProviderState] = useState('')
  const [providerZipLoading, setProviderZipLoading] = useState(false)
  const [providerZipError, setProviderZipError] = useState('')
  const [serviceRadius, setServiceRadius] = useState('10')
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>(['zh'])
  const [hourlyRateMin, setHourlyRateMin] = useState('18')
  const [hourlyRateMax, setHourlyRateMax] = useState('25')
  const [hasCar, setHasCar] = useState(false)
  const [hasLicense, setHasLicense] = useState(false)
  const [workAuth, setWorkAuth] = useState('citizen')

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (data) {
        setRole(data.role)
        setStep(data.role === 'provider' ? 'provider_info' : 'family_info')
      }
    }
    loadUser()
  }, [])

  async function handleFamilyZipChange(zip: string) {
    setFamilyZip(zip)
    setFamilyZipError('')
    if (zip.length === 5) {
      setFamilyZipLoading(true)
      const result = await lookupZipCode(zip)
      if (result) {
        setFamilyCity(result.city)
        setFamilyState(result.state)
      } else {
        setFamilyZipError('Invalid zip code')
        setFamilyCity('')
        setFamilyState('')
      }
      setFamilyZipLoading(false)
    } else {
      setFamilyCity('')
      setFamilyState('')
    }
  }

  async function handleProviderZipChange(zip: string) {
    setProviderZip(zip)
    setProviderZipError('')
    if (zip.length === 5) {
      setProviderZipLoading(true)
      const result = await lookupZipCode(zip)
      if (result) {
        setProviderCity(result.city)
        setProviderState(result.state)
      } else {
        setProviderZipError('Invalid zip code')
        setProviderCity('')
        setProviderState('')
      }
      setProviderZipLoading(false)
    } else {
      setProviderCity('')
      setProviderState('')
    }
  }

  function toggleItem(arr: string[], item: string, setter: (v: string[]) => void) {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item])
  }

  async function handleFamilySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!familyCity) { setFamilyZipError('Please enter a valid zip code'); return }
    setLoading(true)

    const ages = childrenAges.split(',').map(a => parseInt(a.trim())).filter(n => !isNaN(n))

    const { error } = await supabase.from('family_profiles').insert({
      user_id: userId,
      family_name: familyName,
      zip_code: familyZip,
      location_city: familyCity,
      location_state: familyState,
      children_ages: ages,
      language_goals: languageGoals,
      needs_driving: needsDriving,
      needs_cooking: needsCooking,
    })

    if (error) { console.error(error); setLoading(false); return }
    router.push('/dashboard')
    setLoading(false)
  }

  async function handleProviderSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!providerCity) { setProviderZipError('Please enter a valid zip code'); return }
    setLoading(true)

    const { error } = await supabase.from('provider_profiles').insert({
      user_id: userId,
      display_name: displayName,
      zip_code: providerZip,
      location_city: providerCity,
      location_state: providerState,
      service_radius_miles: parseInt(serviceRadius),
      service_types: serviceTypes,
      languages,
      hourly_rate_min: parseFloat(hourlyRateMin),
      hourly_rate_max: parseFloat(hourlyRateMax),
      has_car: hasCar,
      has_drivers_license: hasLicense,
      work_auth: workAuth,
    })

    if (error) { console.error(error); setLoading(false); return }
    router.push('/provider-dashboard')
    setLoading(false)
  }

  if (!role) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-[#C8372D] border-t-transparent rounded-full"/>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4">
      <div className="max-w-lg mx-auto">

        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-gray-900">NiHao Care</span>
          <span className="ml-2 text-xs bg-[#C8372D] text-white px-2 py-0.5 rounded">你好</span>
          <p className="text-gray-500 text-sm mt-2">Let&apos;s set up your profile</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {step === 'family_info' && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tell us about your family</h2>
              <form onSubmit={handleFamilySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Family name</label>
                  <input required value={familyName} onChange={e => setFamilyName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"
                    placeholder="e.g. The Chen Family"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <div className="relative">
                    <input
                      required
                      value={familyZip}
                      onChange={e => handleFamilyZipChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900 ${
                        familyZipError ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="e.g. 20850"/>
                    {familyZipLoading && (
                      <div className="absolute right-3 top-3.5">
                        <div className="animate-spin w-4 h-4 border-2 border-[#C8372D] border-t-transparent rounded-full"/>
                      </div>
                    )}
                  </div>
                  {familyZipError && <p className="text-red-500 text-xs mt-1">{familyZipError}</p>}
                  {familyCity && (
                    <p className="text-green-600 text-xs mt-1">✓ {familyCity}, {familyState}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Children&apos;s ages</label>
                  <input value={childrenAges} onChange={e => setChildrenAges(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"
                    placeholder="e.g. 2, 5, 8"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language goals</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'zh', label: '🇨🇳 Mandarin' },
                      { value: 'en', label: '🇺🇸 English' },
                      { value: 'es', label: '🇪🇸 Spanish' },
                      { value: 'ko', label: '🇰🇷 Korean' },
                    ].map(lang => (
                      <button key={lang.value} type="button"
                        onClick={() => toggleItem(languageGoals, lang.value, setLanguageGoals)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          languageGoals.includes(lang.value)
                            ? 'bg-[#C8372D] text-white border-[#C8372D]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={needsDriving} onChange={e => setNeedsDriving(e.target.checked)}
                      className="w-4 h-4 accent-[#C8372D]"/>
                    <span className="text-sm text-gray-700">Caregiver needs to drive / pick up children</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={needsCooking} onChange={e => setNeedsCooking(e.target.checked)}
                      className="w-4 h-4 accent-[#C8372D]"/>
                    <span className="text-sm text-gray-700">Caregiver should cook meals</span>
                  </label>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#C8372D] hover:bg-[#E85045] text-white font-medium rounded-xl transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : 'Complete Setup →'}
                </button>
              </form>
            </>
          )}

          {step === 'provider_info' && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Set up your caregiver profile</h2>
              <form onSubmit={handleProviderSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
                  <input required value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"
                    placeholder="e.g. Li Wei or Ms. Wang"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <div className="relative">
                    <input
                      required
                      value={providerZip}
                      onChange={e => handleProviderZipChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900 ${
                        providerZipError ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="e.g. 20850"/>
                    {providerZipLoading && (
                      <div className="absolute right-3 top-3.5">
                        <div className="animate-spin w-4 h-4 border-2 border-[#C8372D] border-t-transparent rounded-full"/>
                      </div>
                    )}
                  </div>
                  {providerZipError && <p className="text-red-500 text-xs mt-1">{providerZipError}</p>}
                  {providerCity && (
                    <p className="text-green-600 text-xs mt-1">✓ {providerCity}, {providerState}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service radius — how far can you travel?
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {['5', '10', '15', '20', '30'].map(miles => (
                      <button key={miles} type="button"
                        onClick={() => setServiceRadius(miles)}
                        className={`px-4 py-2 rounded-full text-sm border transition-all ${
                          serviceRadius === miles
                            ? 'bg-[#C8372D] text-white border-[#C8372D]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        {miles} mi
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services offered</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'nanny', label: '👧 Nanny' },
                      { value: 'babysitter', label: '🍼 Babysitter' },
                      { value: 'tutor', label: '📚 Tutor' },
                      { value: 'cook', label: '🍳 Cook' },
                      { value: 'ayi', label: '🏠 阿姨' },
                    ].map(s => (
                      <button key={s.value} type="button"
                        onClick={() => toggleItem(serviceTypes, s.value, setServiceTypes)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          serviceTypes.includes(s.value)
                            ? 'bg-[#C8372D] text-white border-[#C8372D]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages spoken</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'zh', label: '🇨🇳 Mandarin' },
                      { value: 'en', label: '🇺🇸 English' },
                      { value: 'es', label: '🇪🇸 Spanish' },
                      { value: 'ko', label: '🇰🇷 Korean' },
                    ].map(lang => (
                      <button key={lang.value} type="button"
                        onClick={() => toggleItem(languages, lang.value, setLanguages)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          languages.includes(lang.value)
                            ? 'bg-[#C8372D] text-white border-[#C8372D]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly rate range</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <input type="number" value={hourlyRateMin} onChange={e => setHourlyRateMin(e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"/>
                    <span className="text-gray-500">to $</span>
                    <input type="number" value={hourlyRateMax} onChange={e => setHourlyRateMax(e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"/>
                    <span className="text-gray-500">/hr</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work authorization</label>
                  <select value={workAuth} onChange={e => setWorkAuth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900">
                    <option value="citizen">US Citizen</option>
                    <option value="green_card">Green Card</option>
                    <option value="opt">OPT / STEM OPT</option>
                    <option value="ead">EAD (Work Permit)</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={hasLicense} onChange={e => setHasLicense(e.target.checked)}
                      className="w-4 h-4 accent-[#C8372D]"/>
                    <span className="text-sm text-gray-700">I have a valid driver&apos;s license</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={hasCar} onChange={e => setHasCar(e.target.checked)}
                      className="w-4 h-4 accent-[#C8372D]"/>
                    <span className="text-sm text-gray-700">I have my own car</span>
                  </label>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#C8372D] hover:bg-[#E85045] text-white font-medium rounded-xl transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : 'Complete Setup →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}