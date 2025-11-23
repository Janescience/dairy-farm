'use client'

import { LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      await logout()
    }
  }

  if (!user) return null

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <User size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">{user.farmName}</h1>
              <p className="text-sm text-gray-600">{user.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </header>
  )
}