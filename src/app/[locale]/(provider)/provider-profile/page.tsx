'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import LanguagePicker from '@/components/LanguagePicker'

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

export default function ProviderProfileEditPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profileId, setProfileId] = useState('')

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipLoading, setZipLoading] = useState(false)
  const [zipError, setZipError] = useState('')
  const [serviceRadius, setServiceRadius] = useState('10')
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [hourlyRateMin, setHourlyRateMin] = useState('18')
  const [hourlyRateMax, setHourlyRateMax] = useState('25')
  const [hasCar, setHasCar] = useState(false)
  const [hasLicense, setHasLicense] = useState(false)
  const [yearsExp, setYearsExp] = useState('0')
  const [workAuth, setWorkAuth] = useState('citizen')
  const [cookingStyles, setCookingStyles] = useState<string[]>([])

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfileId(data.id)
        setDisplayName(data.display_name || '')
        setBio(data.bio || '')
        setZipCode(data.zip_code || '')
        setCity(data.location_city || '')
        setState(data.location_state || '')
        setServiceRadius(String(data.service_radius_miles || 10))
        setServiceTypes(data.service_types || [])
        setLanguages(data.languages || [])
        setHourlyRateMin(String(data.hourly_rate_min || 18))
        setHourlyRateMax(String(data.hourly_rate_max || 25))
        setHasCar(data.has_car || false)
        setHasLicense(data.has_drivers_license || false)
        setYearsExp(String(data.years_experience || 0))
        setWorkAuth(data.work_auth || 'citizen')
        setCookingStyles(data.cooking_styles || [])
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleZipChange(zip: string) {
    setZipCode(zip)
    setZipError('')
    if (zip.length === 5) {
      setZipLoading(true)
      const result = await lookupZipCode(zip)
      if (result) {
        setCity(result.city)
        setState(result.state)
      } else {
        setZipError('Invalid zip code')
        setCity('')
        setState('')
      }
      setZipLoading(false)
    } else {
      setCity('')
      setState('')
    }
  }

  function toggleItem(arr: string[], item: string, setter: (v: string[]) => void) {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!city) { setZipError('Please enter a valid zip code'); return }
    setSaving(true)

    const { error } = await supabase
      .from('provider_profiles')
      .update({
        display_name: displayName,
        bio,
        zip_code: zipCode,
        location_city: city,
        location_state: state,
        service_radius_miles: parseInt(serviceRadius),
        service_types: serviceTypes,
        languages,
        hourly_rate_min: parseFloat(hourlyRateMin),
        hourly_rate_max: parseFloat(hourlyRateMax),
        has_car: hasCar,
        has_drivers_license: hasLicense,
        years_experience: parseInt(yearsExp),
        work_auth: workAuth,
        cooking_styles: cookingStyles,
      })
      .eq('id', profileId)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-[#C8372D] border-t-transparent rounded-full"/>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <Link href="/provider-dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">NiHao Care</span>
          <span className="text-xs bg-[#C8372D] text-white px-2 py-0.5 rounded">你好</span>
        </Link>
        <Link href="/provider-dashboard" className="text-sm text-gray-500 hover:text-gray-900">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Keep your profile updated to get more matches</p>
        </div>

        {saved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
            ✓ Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"
                placeholder="e.g. Wang Fang or Ms. Li"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900 resize-none"
                placeholder="Tell families about yourself, your experience, and what makes you special..."/>
              <div className="text-xs text-gray-400 mt-1">{bio.length}/500 characters</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
              <div className="relative">
                <input
                  value={zipCode}
                  onChange={e => handleZipChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900 ${
                    zipError ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="e.g. 20850"/>
                {zipLoading && (
                  <div className="absolute right-3 top-3.5">
                    <div className="animate-spin w-4 h-4 border-2 border-[#C8372D] border-t-transparent rounded-full"/>
                  </div>
                )}
              </div>
              {zipError && <p className="text-red-500 text-xs mt-1">{zipError}</p>}
              {city && <p className="text-green-600 text-xs mt-1">✓ {city}, {state}</p>}
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
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Services & Languages</h2>

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

            <LanguagePicker
              selected={languages}
              onChange={setLanguages}
              label="Languages spoken"
            />

            {serviceTypes.includes('cook') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cooking styles</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'chinese', label: '🥢 Chinese' },
                    { value: 'american', label: '🍔 American' },
                    { value: 'korean', label: '🍜 Korean' },
                    { value: 'japanese', label: '🍱 Japanese' },
                    { value: 'healthy', label: '🥗 Healthy' },
                  ].map(c => (
                    <button key={c.value} type="button"
                      onClick={() => toggleItem(cookingStyles, c.value, setCookingStyles)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        cookingStyles.includes(c.value)
                          ? 'bg-[#C8372D] text-white border-[#C8372D]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rate & Experience */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Rate & Experience</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly rate range</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <input type="number" value={hourlyRateMin}
                  onChange={e => setHourlyRateMin(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"/>
                <span className="text-gray-500">to $</span>
                <input type="number" value={hourlyRateMax}
                  onChange={e => setHourlyRateMax(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"/>
                <span className="text-gray-500">/hr</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience</label>
              <input type="number" value={yearsExp}
                onChange={e => setYearsExp(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"/>
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
                <input type="checkbox" checked={hasLicense}
                  onChange={e => setHasLicense(e.target.checked)}
                  className="w-4 h-4 accent-[#C8372D]"/>
                <span className="text-sm text-gray-700">I have a valid driver&apos;s license</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hasCar}
                  onChange={e => setHasCar(e.target.checked)}
                  className="w-4 h-4 accent-[#C8372D]"/>
                <span className="text-sm text-gray-700">I have my own car</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-3 bg-[#C8372D] hover:bg-[#E85045] text-white font-medium rounded-xl transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>

        </form>
      </div>
    </div>
  )
}