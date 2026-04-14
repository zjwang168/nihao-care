'use client'

import { useState, useRef, useEffect } from 'react'

const COMMON_LANGUAGES = [
  { code: 'zh', label: 'Mandarin', native: '普通话', flag: '🇨🇳' },
  { code: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
]

const ALL_LANGUAGES = [
  { code: 'zh', label: 'Mandarin Chinese', native: '普通话', flag: '🇨🇳' },
  { code: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'ko', label: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'ja', label: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { code: 'ru', label: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'it', label: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'th', label: 'Thai', native: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'tl', label: 'Filipino', native: 'Filipino', flag: '🇵🇭' },
  { code: 'id', label: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', label: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'ur', label: 'Urdu', native: 'اردو', flag: '🇵🇰' },
  { code: 'fa', label: 'Persian', native: 'فارسی', flag: '🇮🇷' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', label: 'Polish', native: 'Polski', flag: '🇵🇱' },
  { code: 'nl', label: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
  { code: 'yue', label: 'Cantonese', native: '粵語', flag: '🇭🇰' },
  { code: 'nan', label: 'Hokkien/Taiwanese', native: '閩南語', flag: '🇹🇼' },
]

type Props = {
  selected: string[]
  onChange: (langs: string[]) => void
  label?: string
}

export default function LanguagePicker({ selected, onChange, label = 'Languages' }: Props) {
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSearch(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(code: string) {
    if (selected.includes(code)) {
      onChange(selected.filter(c => c !== code))
    } else {
      onChange([...selected, code])
      setSearch('')
      setShowSearch(false)
    }
  }

  const filtered = ALL_LANGUAGES.filter(l =>
    !COMMON_LANGUAGES.find(c => c.code === l.code) &&
    (l.label.toLowerCase().includes(search.toLowerCase()) ||
     l.native.toLowerCase().includes(search.toLowerCase()))
  )

  // Extra selected languages (not in common 3)
  const extraSelected = ALL_LANGUAGES.filter(l =>
    selected.includes(l.code) && !COMMON_LANGUAGES.find(c => c.code === l.code)
  )

  return (
    <div ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <div className="flex flex-wrap gap-2">
        {/* Common 3 quick-select buttons */}
        {COMMON_LANGUAGES.map(lang => (
          <button key={lang.code} type="button"
            onClick={() => toggle(lang.code)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
              selected.includes(lang.code)
                ? 'bg-[#C8372D] text-white border-[#C8372D]'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            {lang.flag} {lang.label}
          </button>
        ))}

        {/* Extra selected languages */}
        {extraSelected.map(lang => (
          <span key={lang.code}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C8372D] text-white text-sm rounded-full border border-[#C8372D]">
            {lang.flag} {lang.label}
            <button type="button" onClick={() => toggle(lang.code)}
              className="hover:opacity-70 ml-0.5 text-base leading-none">
              ×
            </button>
          </span>
        ))}

        {/* Add more button */}
        <button type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="px-3 py-1.5 rounded-full text-sm border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 transition-all">
          + Add more
        </button>
      </div>

      {/* Search dropdown */}
      {showSearch && (
        <div className="mt-2 relative">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search language..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900 text-sm"
          />
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">No languages found</div>
            ) : (
              filtered.map(lang => (
                <button key={lang.code} type="button"
                  onClick={() => toggle(lang.code)}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    selected.includes(lang.code) ? 'bg-red-50' : ''
                  }`}>
                  <span>{lang.flag}</span>
                  <span className="font-medium text-gray-900">{lang.label}</span>
                  <span className="text-gray-400 text-xs">{lang.native}</span>
                  {selected.includes(lang.code) && (
                    <span className="ml-auto text-[#C8372D] text-xs">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}