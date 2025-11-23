'use client'

import { useState, useEffect } from 'react'
import { Edit3, Save, X, LogOut, Building2, MapPin, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import AuthGuard from '../../components/AuthGuard'
import BottomNavigation from '../../components/BottomNavigation'
import Button from '../../components/Button'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [farmData, setFarmData] = useState({
    name: '',
    location: '',
    owner: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user?.farmId) {
      fetchFarmData()
    }
  }, [user])

  const fetchFarmData = async () => {
    try {
      const response = await fetch(`/api/farms/${user.farmId}`)
      const data = await response.json()

      if (data.success) {
        setFarmData({
          name: data.data.name,
          location: data.data.location,
          owner: data.data.owner
        })
      }
    } catch (error) {
      console.error('Error fetching farm data:', error)
    }
  }

  const handleSave = async () => {
    if (!farmData.name || !farmData.location || !farmData.owner) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/farms/${user.farmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('อัพเดตข้อมูลฟาร์มสำเร็จ')
        setEditing(false)
        // อาจต้องอัพเดต auth context ด้วย
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการอัพเดต')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      await logout()
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setError('')
    setSuccess('')
    if (user?.farmId) {
      fetchFarmData()
    }
  }

  if (!user) {
    return null
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

        {/* Content */}
        <div className="p-4 pb-28">
          <div className="w-full max-w-md mx-auto space-y-6">



            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            {/* Farm Info Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">ข้อมูลฟาร์ม</h3>
                </div>

                {!editing && user.role === 'owner' && (
                  <Button
                    onClick={() => setEditing(true)}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    <Edit3 size={16} className="mr-2" />
                    แก้ไข
                  </Button>
                )}

                {editing && (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleCancel}
                      variant="secondary"
                      size="sm"
                    >
                      <X size={16} className="mr-2" />
                      ยกเลิก
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      loading={loading}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                    >
                      <Save className="mr-2" size={16} />
                      บันทึก
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อฟาร์ม
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={farmData.name}
                      onChange={(e) => setFarmData({ ...farmData, name: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-300"
                      placeholder="ชื่อฟาร์ม"
                    />
                  ) : (
                    <div className="w-full px-3 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {farmData.name || '-'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    ที่ตั้ง
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={farmData.location}
                      onChange={(e) => setFarmData({ ...farmData, location: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-300"
                      placeholder="ที่ตั้งฟาร์ม"
                    />
                  ) : (
                    <div className="w-full px-3 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {farmData.location || '-'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เจ้าของฟาร์ม
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={farmData.owner}
                      onChange={(e) => setFarmData({ ...farmData, owner: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-300"
                      placeholder="ชื่อเจ้าของฟาร์ม"
                    />
                  ) : (
                    <div className="w-full px-3 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {farmData.owner || '-'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รหัสฟาร์ม
                  </label>
                  <div className="w-full px-3 py-3 bg-gray-50 rounded-xl text-gray-600 font-mono text-xs break-all">
                    {user.farmId}
                  </div>
                </div>
              </div>
            </div>

            {/* Permission Notice */}
            {user.role !== 'owner' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="text-yellow-800 text-sm font-medium">
                  📝 เฉพาะเจ้าของฟาร์มเท่านั้นที่สามารถแก้ไขข้อมูลได้
                </div>
              </div>
            )}

            {/* Logout Button */}
            <div className="">
              <Button
                onClick={handleLogout}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              >
                <LogOut size={20} className="mr-3" />
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}