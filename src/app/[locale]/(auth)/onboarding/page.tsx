'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Step = 'family_info' | 'provider_info'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<'family' | 'provider' | 'both' | null>(null)
  const [step, setStep] = useState<Step>('family_info')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')

  const [familyName, setFamilyName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('MD')
  const [childrenAges, setChildrenAges] = useState('')
  const [languageGoals, setLanguageGoals] = useState<string[]>(['zh'])
  const [needsDriving, setNeedsDriving] = useState(false)
  const [needsCooking, setNeedsCooking] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [providerCity, setProviderCity] = useState('')
  const [providerState, setProviderState] = useState('MD')
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

  function toggleItem(arr: string[], item: string, setter: (v: string[]) => void) {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item])
  }

  async function handleFamilySubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const ages = childrenAges.split(',').map(a => parseInt(a.trim())).filter(n => !isNaN(n))

    const { error } = await supabase.from('family_profiles').insert({
      user_id: userId,
      family_name: familyName,
      location_city: city,
      location_state: state,
      children_ages: ages,
      language_goals: languageGoals,
      needs_driving: needsDriving,
      needs_cooking: needsCooking,
    })

    if (error) { console.error(error); setLoading(false); return }
    if (role === 'both') { setStep('provider_info') } else { router.push('/dashboard') }
    setLoading(false)
  }

  async function handleProviderSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('provider_profiles').insert({
      user_id: userId,
      display_name: displayName,
      location_city: providerCity,
      location_state: providerState,
      service_types: serviceTypes,
      languages,
      hourly_rate_min: parseFloat(hourlyRateMin),
      hourly_rate_max: parseFloat(hourlyRateMax),
      has_car: hasCar,
      has_drivers_license: hasLicense,
      work_auth: workAuth,
    })

    if (error) { console.error(error); setLoading(false); return }
    router.push('/provider-dashboard')  // ← 这里改了
    setLoading(false)
  }

  const US_STATES = ['MD', 'VA', 'DC', 'NY', 'CA', 'TX', 'WA', 'IL', 'MA', 'GA']

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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input required value={city} onChange={e => setCity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"
                      placeholder="Rockville"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select value={state} onChange={e => setState(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900">
                      {US_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
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
                  {loading ? 'Saving...' : role === 'both' ? 'Next: Caregiver Profile →' : 'Complete Setup →'}
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input required value={providerCity} onChange={e => setProviderCity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"
                      placeholder="Rockville"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select value={providerState} onChange={e => setProviderState(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900">
                      {US_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
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