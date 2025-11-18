'use client'

import { usePathname } from 'next/navigation'
import { Home, Milk, Settings } from 'lucide-react'

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100/50 z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
      <div className="flex px-2 py-2">
        <a
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl mx-1 transition-all duration-300 ${
            pathname === '/'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
          }`}
        >
          <Home size={22} className="transition-all duration-300" />
          <span className="mt-1 font-light text-lg">หน้าหลัก</span>
        </a>
        <a
          href="/milk"
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl mx-1 transition-all duration-300 ${
            pathname === '/milk'
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
          }`}
        >
          <Milk size={22} className="transition-all duration-300" />
          <span className="mt-1 font-light text-lg">รีดนม</span>
        </a>
        <a
          href="/settings"
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl mx-1 transition-all duration-300 ${
            pathname === '/settings'
              ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
          }`}
        >
          <Settings size={22} className="transition-all duration-300" />
          <span className="mt-1 font-light text-lg">ตั้งค่า</span>
        </a>
      </div>
    </nav>
  )
}