'use client'

import { useState, useEffect } from 'react'
import { Milk, Settings, Edit3, Trash2, Plus, Loader2, Users } from 'lucide-react'
import { useCows } from '../../hooks/useCows'
import { useFarms } from '../../hooks/useFarms'
import Avatar from '../../components/Avatar'
import BottomNavigation from '../../components/BottomNavigation'
import Button from '../../components/Button'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('cows')
  const [selectedFarmId, setSelectedFarmId] = useState(null)
  const [newCow, setNewCow] = useState({ name: '' })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingFarm, setEditingFarm] = useState(false)
  const [farmData, setFarmData] = useState({
    name: '',
    location: '',
    owner: ''
  })

  // Hooks
  const { farms, loading: farmsLoading } = useFarms()
  const { cows, loading: cowsLoading, error: cowsError, createCow, updateCow, deleteCow } = useCows(selectedFarmId)

  // Set default farm when farms load
  useEffect(() => {
    if (farms.length > 0 && !selectedFarmId) {
      setSelectedFarmId(farms[0]._id)
    }
  }, [farms, selectedFarmId])

  // Set farm data when farm is selected
  useEffect(() => {
    if (farms.length > 0 && selectedFarmId) {
      const farm = farms.find(f => f._id === selectedFarmId)
      if (farm) {
        setFarmData({
          name: farm.name || '',
          location: farm.location || '',
          owner: farm.owner || ''
        })
      }
    }
  }, [farms, selectedFarmId])

  // Handle create cow
  const handleCreateCow = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    console.log('Creating cow:', { newCow, selectedFarmId })


    // Validation
    if (!newCow.name.trim()) {
      setErrors({ name: 'กรุณาระบุชื่อโค' })
      return
    }

    const result = await createCow({
      name: newCow.name.trim()
    })

    console.log('Create cow result:', result)

    if (result.success) {
      setNewCow({ name: '' })
      setSuccessMessage('เพิ่มโคเรียบร้อยแล้ว')
      setTimeout(() => setSuccessMessage(''), 3000)
    } else {
      setErrors({ submit: result.error || 'เกิดข้อผิดพลาดในการเพิ่มโค' })
    }
  }


  // Handle edit farm
  const handleEditFarm = () => {
    setEditingFarm(true)
    setErrors({})
  }

  // Handle update farm
  const handleUpdateFarm = async (e) => {
    e.preventDefault()
    setErrors({})

    // Validation
    if (!farmData.name.trim()) {
      setErrors({ farmName: 'กรุณาระบุชื่อฟาร์ม' })
      return
    }
    if (!farmData.location.trim()) {
      setErrors({ farmLocation: 'กรุณาระบุที่ตั้งฟาร์ม' })
      return
    }
    if (!farmData.owner.trim()) {
      setErrors({ farmOwner: 'กรุณาระบุชื่อเจ้าของฟาร์ม' })
      return
    }

    try {
      const response = await fetch(`/api/farms/${selectedFarmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: farmData.name.trim(),
          location: farmData.location.trim(),
          owner: farmData.owner.trim()
        })
      })

      const result = await response.json()

      if (result.success) {
        setEditingFarm(false)
        setSuccessMessage('อัปเดตข้อมูลฟาร์มเรียบร้อยแล้ว')
        setTimeout(() => setSuccessMessage(''), 3000)
        // Reload farms data
        window.location.reload()
      } else {
        setErrors({ farmSubmit: result.error || 'เกิดข้อผิดพลาดในการอัปเดต' })
      }
    } catch (error) {
      setErrors({ farmSubmit: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    }
  }

  // Filter cows based on search term
  const filteredCows = cows.filter(cow =>
    cow.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">


      {/* Modern Glass Tab Navigation */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] sticky top-0 z-30">
        <div className="p-4">
          <div className="flex relative">
            <button
              onClick={() => setActiveTab('cows')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xl font-light transition-all duration-300 relative ${
                activeTab === 'cows'
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={20} />
              <span>จัดการโค</span>
              {activeTab === 'cows' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-sm"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xl font-light transition-all duration-300 relative ${
                activeTab === 'general'
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings size={20} />
              <span>ทั่วไป</span>
              {activeTab === 'general' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-sm"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-40">
        <div className="max-w-2xl mx-auto">
          {/* Cows Management Tab */}
          {activeTab === 'cows' && (
            <div className="space-y-6">

              {/* Modern Toast Notification */}
              {successMessage && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-[0_12px_32px_rgba(16,185,129,0.4)] backdrop-blur-xl border border-white/20 z-50 animate-bounce">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg">{successMessage}</span>
                  </div>
                </div>
              )}

              {/* Modern Error Message */}
              {cowsError && (
                <div className="bg-red-50/90 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium shadow-sm">
                  {cowsError}
                </div>
              )}

              {/* Modern Glass Search Cows */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-0 p-6">
                <label className="block text-lg font-light text-gray-700 mb-3">
                  ค้นหาชื่อโค
                </label>
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อโคที่ต้องการค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/60 backdrop-blur-sm border-0 rounded-xl px-4 py-3 text-lg font-light shadow-md focus:ring-2 focus:ring-blue-500/30 focus:bg-white/80 transition-all duration-200"
                />
              </div>

              {/* Modern Glass Cows List */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-0 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-50/30 to-purple-50/30">
                  <h3 className="font-light text-lg text-gray-900">
                    รายชื่อโค {filteredCows.length > 0 && `(${filteredCows.length} ตัว)`}
                    {searchTerm && ` - ผลการค้นหา "${searchTerm}"`}
                  </h3>
                </div>

                {cowsLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 size={32} className="animate-spin mx-auto text-gray-400" />
                    <p className="mt-3 text-sm font-medium text-gray-500">กำลังโหลดข้อมูล...</p>
                  </div>
                ) : filteredCows.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Milk size={32} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      {searchTerm ? 'ไม่พบโคที่ค้นหา' : 'ยังไม่มีโคในฟาร์มนี้'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 p-6">
                    {filteredCows.map((cow, index) => (
                      <button
                        key={cow._id}
                        onClick={() => window.location.href = `/cows/${cow._id}`}
                        className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all duration-300 text-center shadow-sm hover:shadow-md group"
                      >
                        <div className="flex flex-col items-center space-y-3">
                          <div className="relative">
                            <Avatar
                              username={cow.name}
                              size={40}
                              className="rounded-full"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-xs font-bold text-white">{index + 1}</span>
                            </div>
                          </div>
                          <span className="font-medium text-lg text-center leading-tight">
                            {cow.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {selectedFarmId && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-normal">ข้อมูลฟาร์ม</h2>
                    {!editingFarm && (
                      <Button
                        onClick={handleEditFarm}
                        variant="primary"
                        size="md"
                      >
                        แก้ไข
                      </Button>
                    )}
                  </div>

                  {farmsLoading ? (
                    <div className="p-4 text-center">
                      <Loader2 size={24} className="animate-spin mx-auto text-gray-400" />
                      <p className="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateFarm} className="space-y-4">
                      <div>
                        <label className="block text-lg font-normal text-gray-700 mb-2">
                          ชื่อฟาร์ม
                        </label>
                        <input
                          type="text"
                          value={farmData.name}
                          onChange={(e) => setFarmData(prev => ({ ...prev, name: e.target.value }))}
                          readOnly={!editingFarm}
                          className={`w-full border rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-black focus:border-black ${
                            editingFarm
                              ? errors.farmName
                                ? 'border-red-300'
                                : 'border-gray-300'
                              : 'border-gray-300 bg-gray-50 text-gray-600'
                          }`}
                        />
                        {errors.farmName && (
                          <p className="mt-1 text-lg text-red-600">{errors.farmName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-lg font-normal text-gray-700 mb-2">
                          ที่ตั้ง
                        </label>
                        <input
                          type="text"
                          value={farmData.location}
                          onChange={(e) => setFarmData(prev => ({ ...prev, location: e.target.value }))}
                          readOnly={!editingFarm}
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black ${
                            editingFarm
                              ? errors.farmLocation
                                ? 'border-red-300'
                                : 'border-gray-300'
                              : 'border-gray-300 bg-gray-50 text-gray-600'
                          }`}
                        />
                        {errors.farmLocation && (
                          <p className="mt-1 text-lg text-red-600">{errors.farmLocation}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-lg font-normal text-gray-700 mb-2">
                          เจ้าของ
                        </label>
                        <input
                          type="text"
                          value={farmData.owner}
                          onChange={(e) => setFarmData(prev => ({ ...prev, owner: e.target.value }))}
                          readOnly={!editingFarm}
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black ${
                            editingFarm
                              ? errors.farmOwner
                                ? 'border-red-300'
                                : 'border-gray-300'
                              : 'border-gray-300 bg-gray-50 text-gray-600'
                          }`}
                        />
                        {errors.farmOwner && (
                          <p className="mt-1 text-lg text-red-600">{errors.farmOwner}</p>
                        )}
                      </div>

                      {errors.farmSubmit && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-lg">
                          {errors.farmSubmit}
                        </div>
                      )}

                      {editingFarm && (
                        <div className="flex space-x-2">
                          <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={farmsLoading}
                            loading={farmsLoading}
                          >
                            บันทึก
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => {
                              setEditingFarm(false)
                              setErrors({})
                              // Reset form data
                              const farm = farms.find(f => f._id === selectedFarmId)
                              if (farm) {
                                setFarmData({
                                  name: farm.name || '',
                                  location: farm.location || '',
                                  owner: farm.owner || ''
                                })
                              }
                            }}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Add Cow Form - Fixed Bottom */}
      {activeTab === 'cows' && (
        <div className="fixed bottom-20 left-4 right-4 bg-white/90 backdrop-blur-xl border border-white/30 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] rounded-t-3xl z-40">
          <div className="p-5">
    

            <form onSubmit={handleCreateCow} className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="ป้อนชื่อโค..."
                value={newCow.name}
                onChange={(e) => setNewCow(prev => ({ ...prev, name: e.target.value }))}
                className={`flex-1 min-w-0 border-0 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:outline-none transition-all duration-300 ${
                  errors.name ? 'focus:ring-red-300 bg-red-50/50' : 'focus:ring-blue-300'
                }`}
                disabled={cowsLoading}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={cowsLoading}
                loading={cowsLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 font-semibold rounded-xl px-6 py-3 shadow-lg"
              >
                เพิ่ม
              </Button>
            </form>

            {/* Error Messages */}
            {(errors.name || errors.submit) && (
              <div className="mt-3 p-3 bg-red-50/80 border border-red-200 rounded-xl text-red-700 text-sm">
                {errors.name || errors.submit}
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  )
}