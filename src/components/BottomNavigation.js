'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Milk, Settings, User } from 'lucide-react'

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100/50 z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
        <div className="flex px-2 py-2">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 mx-1 transition-all duration-300 ${
            pathname === '/'
              ? 'text-gray-900 font-semibold border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home size={18} className="transition-all duration-300" />
          <span className="mt-1 font-light text-sm">หน้าหลัก</span>
        </Link>
        <Link
          href="/milk"
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 mx-1 transition-all duration-300 ${
            pathname === '/milk'
              ? 'text-black font-bold border-b-2 border-green-500'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Milk size={18} className="transition-all duration-300" />
          <span className="mt-1 font-light text-sm">รีดนม</span>
        </Link>
        <Link
          href="/settings"
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 mx-1 transition-all duration-300 ${
            pathname === '/settings'
              ? 'text-black font-semibold border-b-2 border-purple-500'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Settings size={18} className="transition-all duration-300" />
          <span className="mt-1 font-light text-sm">ตั้งค่า</span>
        </Link>
        <Link
          href="/profile"
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 mx-1 transition-all duration-300 ${
            pathname === '/profile'
              ? 'text-gray-900 font-semibold border-b-2 border-indigo-500'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <User size={18} className="transition-all duration-300" />
          <span className="mt-1 font-light text-sm">โปรไฟล์</span>
        </Link>
      </div>
      </nav>
    </>
  )
}