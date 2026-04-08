import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* Nav */}
      <nav className="px-6 py-5 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">NiHao Care</span>
          <span className="text-xs bg-[#C8372D] text-white px-2 py-0.5 rounded">你好</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Log In
          </Link>
          <Link href="/register"
            className="text-sm bg-[#C8372D] text-white px-4 py-2 rounded-full hover:bg-[#E85045] transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-500 mb-8 shadow-sm">
            <span className="w-2 h-2 bg-[#C8372D] rounded-full animate-pulse"/>
            Now serving DC · Maryland · Virginia
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Find a caregiver who speaks your{' '}
            <span className="text-[#C8372D]">family&apos;s language</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 leading-relaxed">
            NiHao Care connects families with Mandarin-speaking nannies, tutors,
            and household helpers — vetted, certified, and matched by culture.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/register?role=family"
              className="px-8 py-4 bg-[#C8372D] text-white font-medium rounded-full hover:bg-[#E85045] transition-all shadow-lg shadow-red-200 hover:shadow-xl hover:-translate-y-0.5">
              Find a Caregiver →
            </Link>
            <Link href="/register?role=provider"
              className="px-8 py-4 bg-white text-gray-900 font-medium rounded-full hover:shadow-md transition-all border border-gray-200">
              I&apos;m a Caregiver
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-14 pt-10 border-t border-gray-200">
            {[
              { value: '中英', label: 'Bilingual platform' },
              { value: '免费', label: 'Free to join' },
              { value: 'DC', label: 'Launching first' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-200">
        <div className="text-xs font-semibold tracking-widest text-[#C8372D] uppercase mb-3">
          How it works
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-12">
          Simple, from search to first day
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Tell us what you need',
              desc: 'Share your family\'s language goals, schedule, and care preferences.',
              icon: '📋'
            },
            {
              step: '02',
              title: 'Browse certified caregivers',
              desc: 'Filter by language, service type, location, and availability.',
              icon: '🔍'
            },
            {
              step: '03',
              title: 'Connect & find your match',
              desc: 'Message directly, schedule an interview, and start your care journey.',
              icon: '💬'
            },
          ].map(item => (
            <div key={item.step} className="bg-white rounded-2xl p-6 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-6xl font-black text-gray-50">
                {item.step}
              </div>
              <div className="text-3xl mb-4">{item.icon}</div>
              <div className="font-semibold text-gray-900 mb-2">{item.title}</div>
              <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* For who */}
      <section className="bg-gray-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">
            Who it&apos;s for
          </div>
          <h2 className="text-3xl font-bold text-white mb-10">
            Built for two sides of the same family
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                emoji: '🏠',
                role: 'For Families',
                title: 'Find your perfect match',
                items: [
                  'Chinese-American families wanting Mandarin immersion',
                  'American families raising bilingual children',
                  'Busy families needing trusted home help',
                  'Families seeking culturally connected care',
                ]
              },
              {
                emoji: '👩‍👧',
                role: 'For Caregivers',
                title: 'Find families who value you',
                items: [
                  'Mandarin-speaking nannies & tutors',
                  'Chinese cooking & household helpers',
                  'Experienced 阿姨 in your community',
                  'Anyone who wants to share their culture',
                ]
              }
            ].map(card => (
              <div key={card.role}
                className="border border-gray-700 rounded-2xl p-8 hover:border-gray-500 transition-colors">
                <div className="text-3xl mb-4">{card.emoji}</div>
                <div className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">
                  {card.role}
                </div>
                <div className="text-xl font-bold text-white mb-6">{card.title}</div>
                <ul className="space-y-3">
                  {card.items.map(item => (
                    <li key={item} className="flex items-start gap-3 text-gray-400 text-sm">
                      <span className="text-[#C8372D] mt-0.5">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-xs font-semibold tracking-widest text-[#C8372D] uppercase mb-3">
          Why NiHao Care
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-10">
          Trust built in, not bolted on
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🛡️', title: 'Background Checks', desc: 'Optional but visible. Verified caregivers get a prominent badge families can trust.' },
            { icon: '🗣️', title: 'Language Verified', desc: 'We verify Mandarin proficiency — no more guessing from a profile.' },
            { icon: '⭐', title: 'Two-Way Reviews', desc: 'Families review caregivers and caregivers review families.' },
            { icon: '🔒', title: 'Privacy First', desc: 'Caregivers control their visibility. Photos revealed only when ready.' },
          ].map(item => (
            <div key={item.title}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:-translate-y-1 transition-transform">
              <div className="text-2xl mb-3">{item.icon}</div>
              <div className="font-semibold text-gray-900 text-sm mb-1">{item.title}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#C8372D] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-xs font-semibold tracking-widest text-red-200 uppercase mb-3">
            Early Access
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Be the first in DC to find your match
          </h2>
          <p className="text-red-100 mb-8">
            We&apos;re launching in the DC-Maryland-Virginia area.
            Join free and get early access today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register"
              className="px-8 py-4 bg-white text-[#C8372D] font-semibold rounded-full hover:shadow-lg transition-all">
              Join Free →
            </Link>
            <Link href="/register?role=provider"
              className="px-8 py-4 border-2 border-white/50 text-white font-medium rounded-full hover:border-white transition-colors">
              Join as Caregiver
            </Link>
          </div>

          <div className="flex gap-8 justify-center mt-10">
            {[
              { value: '免费', label: 'Free to join' },
              { value: '中英', label: 'Bilingual' },
              { value: '安心', label: 'Peace of mind' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-red-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200 flex justify-between items-center max-w-6xl mx-auto flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">NiHao Care</span>
          <span className="text-xs bg-[#C8372D] text-white px-2 py-0.5 rounded">你好</span>
        </div>
        <div className="text-sm text-gray-400">
          © 2025 NiHao Care · Washington DC · 你好，我们在这里
        </div>
        <div className="text-sm text-gray-400">Made with ❤️ for bilingual families</div>
      </footer>

    </div>
  )
}