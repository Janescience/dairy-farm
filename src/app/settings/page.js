'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, Users, Edit3, Trash2 } from 'lucide-react'
import { useCows } from '../../hooks/useCows'
import { useFarms } from '../../hooks/useFarms'
import Avatar from '../../components/Avatar'
import BottomNavigation from '../../components/BottomNavigation'
import Button from '../../components/Button'
import AuthGuard from '../../components/AuthGuard'

export default function SettingsPage() {
  const [selectedFarmId, setSelectedFarmId] = useState(null)
  const [newCow, setNewCow] = useState({ name: '' })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Hooks
  const { farms, loading: farmsLoading } = useFarms()
  const { cows, loading: cowsLoading, error: cowsError, createCow } = useCows(selectedFarmId)

  // Set first farm as selected when farms are loaded
  useEffect(() => {
    if (farms && farms.length > 0 && !selectedFarmId) {
      setSelectedFarmId(farms[0]._id)
    }
  }, [farms, selectedFarmId])

  // Clear messages after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleCreateCow = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    if (!newCow.name.trim()) {
      setErrors({ name: 'กรุณากรอกชื่อโค' })
      return
    }

    const result = await createCow({
      name: newCow.name.trim(),
      age: newCow.age || 0
    })

    if (result.success) {
      setNewCow({ name: '' })
      setSuccessMessage('เพิ่มโคสำเร็จ')
    } else {
      setErrors({ general: result.error || 'เกิดข้อผิดพลาดในการเพิ่มโค' })
    }
  }

  const filteredCows = cows.filter(cow =>
    cow.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] sticky top-0 z-30">
          <div className="p-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">จัดการโค</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 pb-40">
          <div className="max-w-2xl mx-auto">

            {/* Success/Error Messages */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                {errors.general}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
                {successMessage}
              </div>
            )}

            {/* Search */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6 mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300"
                placeholder="ค้นหาโค..."
              />
            </div>

            {/* Cows List */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">รายการโค</h3>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {filteredCows.length} ตัว
                </span>
              </div>

              {cowsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin mr-2" size={20} />
                  <span className="text-gray-600">กำลังโหลด...</span>
                </div>
              ) : cowsError ? (
                <div className="text-center py-8 text-red-600">
                  เกิดข้อผิดพลาด: {cowsError}
                </div>
              ) : filteredCows.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'ไม่พบโคที่ค้นหา' : 'ยังไม่มีโคในระบบ'}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {filteredCows.map((cow) => (
                    <div
                      key={cow._id}
                      onClick={() => window.location.href = `/cows/${cow._id}`}
                      className="bg-gray-50/80 hover:bg-gray-100/80 rounded-2xl p-4 transition-all duration-200 cursor-pointer text-center"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm mx-auto mb-3">
                        <Avatar username={cow.name} size={32} className="rounded-lg" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{cow.name}</h4>
  
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add New Cow Form - Fixed at bottom */}
        <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100/50 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] z-40">
          <div className="p-5">
            <form onSubmit={handleCreateCow} className="flex gap-3">
              <input
                type="text"
                value={newCow.name}
                onChange={(e) => setNewCow({ ...newCow, name: e.target.value })}
                className={`flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300 ${
                  errors.name ? 'border-red-300 bg-red-50' : ''
                }`}
                placeholder="ชื่อโค"
              />
              <Button
                type="submit"
                disabled={cowsLoading}
                className="bg-gradient-to-r rounded-xl  from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-6"
              >
                เพิ่ม
              </Button>
            </form>
            {errors.name && (
              <p className="text-red-600 text-sm mt-2 px-1">{errors.name}</p>
            )}
          </div>
        </div>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}