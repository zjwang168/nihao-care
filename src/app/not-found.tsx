import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-500 mb-8">找不到这个页面 · Page not found</p>
        <div className="flex gap-4 justify-center">
          <Link href="/en"
            className="px-6 py-3 bg-[#C8372D] text-white font-medium rounded-full hover:bg-[#E85045] transition-colors">
            回首页 · Go Home
          </Link>
          <Link href="/en/login"
            className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-full hover:border-gray-300 transition-colors">
            Sign In · 登录
          </Link>
        </div>
      </div>
    </div>
  )
}