'use client'

import { useState, useEffect } from 'react'
import { Milk, Settings, Edit3, Trash2, Plus, Loader2 } from 'lucide-react'
import { useCows } from '../../hooks/useCows'
import { useFarms } from '../../hooks/useFarms'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('cows')
  const [selectedFarmId, setSelectedFarmId] = useState(null)
  const [newCow, setNewCow] = useState({ name: '', age: '' })
  const [editingCow, setEditingCow] = useState(null)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  // Hooks
  const { farms, loading: farmsLoading } = useFarms()
  const { cows, loading: cowsLoading, error: cowsError, createCow, updateCow, deleteCow } = useCows(selectedFarmId)

  // Set default farm when farms load
  useEffect(() => {
    if (farms.length > 0 && !selectedFarmId) {
      setSelectedFarmId(farms[0]._id)
    }
  }, [farms, selectedFarmId])

  // Handle create cow
  const handleCreateCow = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    console.log('Creating cow:', { newCow, selectedFarmId })

    // Check if farm is selected
    if (!selectedFarmId) {
      setErrors({ submit: 'กรุณาเลือกฟาร์มก่อน' })
      return
    }

    // Validation
    if (!newCow.name.trim()) {
      setErrors({ name: 'กรุณาระบุชื่อโค' })
      return
    }
    if (!newCow.age || newCow.age < 0 || newCow.age > 30) {
      setErrors({ age: 'อายุต้องอยู่ระหว่าง 0-30 ปี' })
      return
    }

    const result = await createCow({
      name: newCow.name.trim(),
      age: parseInt(newCow.age)
    })

    console.log('Create cow result:', result)

    if (result.success) {
      setNewCow({ name: '', age: '' })
      setSuccessMessage('เพิ่มโคเรียบร้อยแล้ว')
      setTimeout(() => setSuccessMessage(''), 3000)
    } else {
      setErrors({ submit: result.error || 'เกิดข้อผิดพลาดในการเพิ่มโค' })
    }
  }

  // Handle edit cow
  const handleEditCow = (cow) => {
    setEditingCow({ ...cow })
    setErrors({})
  }

  // Handle update cow
  const handleUpdateCow = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!editingCow.name.trim()) {
      setErrors({ editName: 'กรุณาระบุชื่อโค' })
      return
    }
    if (!editingCow.age || editingCow.age < 0 || editingCow.age > 30) {
      setErrors({ editAge: 'อายุต้องอยู่ระหว่าง 0-30 ปี' })
      return
    }

    const result = await updateCow(editingCow._id, {
      name: editingCow.name.trim(),
      age: parseInt(editingCow.age)
    })

    if (result.success) {
      setEditingCow(null)
      setSuccessMessage('อัปเดตข้อมูลเรียบร้อยแล้ว')
      setTimeout(() => setSuccessMessage(''), 3000)
    } else {
      setErrors({ editSubmit: result.error })
    }
  }

  // Handle delete cow
  const handleDeleteCow = async (cowId) => {
    if (confirm('คุณต้องการลบโคนี้หรือไม่?')) {
      const result = await deleteCow(cowId)
      if (result.success) {
        setSuccessMessage('ลบโคเรียบร้อยแล้ว')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrors({ submit: result.error })
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-light text-black">
              ตั้งค่า
            </h1>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-30">
        <div className="px-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('cows')}
              className={`py-3 px-1 border-b-2 font-light text-lg transition-colors ${
                activeTab === 'cows'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              จัดการโค
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`py-3 px-1 border-b-2 font-light text-lg transition-colors ${
                activeTab === 'general'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ทั่วไป
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20 md:pb-4">
        <div className="max-w-2xl mx-auto">
          {/* Cows Management Tab */}
          {activeTab === 'cows' && (
            <div className="space-y-6">
              {/* Farm Selection */}
              {farms.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="block text-lg font-light text-gray-700 mb-2">
                    เลือกฟาร์ม
                  </label>
                  <select
                    value={selectedFarmId || ''}
                    onChange={(e) => setSelectedFarmId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  >
                    {farms.map((farm) => (
                      <option key={farm._id} value={farm._id}>
                        {farm.name} - {farm.location}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {cowsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {cowsError}
                </div>
              )}

              {/* Add New Cow */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-light mb-4">เพิ่มโคใหม่</h2>
                <form onSubmit={handleCreateCow} className="space-y-4">
                  <div>
                    <label className="block text-lg font-light text-gray-700 mb-2">
                      ชื่อโค
                    </label>
                    <input
                      type="text"
                      placeholder="ระบุชื่อโค"
                      value={newCow.name}
                      onChange={(e) => setNewCow(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={cowsLoading}
                    />
                    {errors.name && (
                      <p className="mt-1 text-lg text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-light text-gray-700 mb-2">
                      อายุ (ปี)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      placeholder="0"
                      value={newCow.age}
                      onChange={(e) => setNewCow(prev => ({ ...prev, age: e.target.value }))}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black ${
                        errors.age ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={cowsLoading}
                    />
                    {errors.age && (
                      <p className="mt-1 text-lg text-red-600">{errors.age}</p>
                    )}
                  </div>

                  {errors.submit && (
                    <p className="text-lg text-red-600">{errors.submit}</p>
                  )}

                  <button
                    type="submit"
                    disabled={cowsLoading || !selectedFarmId}
                    className="w-full bg-black text-white py-3 px-4 rounded-lg font-light hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {cowsLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>กำลังเพิ่ม...</span>
                      </>
                    ) : (
                      <span>เพิ่มโค</span>
                    )}
                  </button>
                </form>
              </div>

              {/* Cows List */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-light">
                    รายชื่อโค {cows.length > 0 && `(${cows.length} ตัว)`}
                  </h3>
                </div>

                {cowsLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 size={32} className="animate-spin mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
                  </div>
                ) : cows.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    ยังไม่มีโคในฟาร์มนี้
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {cows.map((cow) => (
                      <div key={cow._id} className="p-4">
                        {editingCow?._id === cow._id ? (
                          // Edit Form
                          <form onSubmit={handleUpdateCow} className="space-y-3">
                            <div className="flex space-x-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="ชื่อโค"
                                  value={editingCow.name}
                                  onChange={(e) => setEditingCow(prev => ({ ...prev, name: e.target.value }))}
                                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black ${
                                    errors.editName ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors.editName && (
                                  <p className="mt-1 text-lg text-red-600">{errors.editName}</p>
                                )}
                              </div>
                              <div className="w-24">
                                <input
                                  type="number"
                                  placeholder="อายุ"
                                  min="0"
                                  max="30"
                                  value={editingCow.age}
                                  onChange={(e) => setEditingCow(prev => ({ ...prev, age: e.target.value }))}
                                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black ${
                                    errors.editAge ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors.editAge && (
                                  <p className="mt-1 text-lg text-red-600">{errors.editAge}</p>
                                )}
                              </div>
                            </div>
                            {errors.editSubmit && (
                              <p className="text-lg text-red-600">{errors.editSubmit}</p>
                            )}
                            <div className="flex space-x-2">
                              <button
                                type="submit"
                                disabled={cowsLoading}
                                className="px-3 py-1 bg-black text-white text-lg rounded hover:bg-gray-800 disabled:opacity-50"
                              >
                                บันทึก
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCow(null)}
                                className="px-3 py-1 border border-gray-300 text-lg rounded hover:bg-gray-50"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </form>
                        ) : (
                          // Display Mode
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-light">{cow.name}</span>
                              <span className="text-lg text-gray-500 ml-3">อายุ {cow.age} ปี</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditCow(cow)}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={cowsLoading}
                              >
                                <Edit3 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteCow(cow._id)}
                                className="text-gray-400 hover:text-red-600"
                                disabled={cowsLoading}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-light mb-4">ข้อมูลฟาร์ม</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-light text-gray-700 mb-2">
                      ชื่อฟาร์ม
                    </label>
                    <input
                      type="text"
                      defaultValue="ฟาร์มสุขใส"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-light text-gray-700 mb-2">
                      ที่ตั้ง
                    </label>
                    <input
                      type="text"
                      defaultValue="นครปฐม"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-light text-gray-700 mb-2">
                      เจ้าของ
                    </label>
                    <input
                      type="text"
                      defaultValue="คุณสมชาย"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>

                  <button className="w-full bg-black text-white py-3 px-4 rounded-lg font-light hover:bg-gray-800 transition-colors">
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-light mb-4">เกี่ยวกับแอป</h3>
                <div className="text-lg text-gray-600 space-y-2">
                  <p>เวอร์ชัน: 1.0.0</p>
                  <p>ระบบจัดการฟาร์มโคนม</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="flex">
          <a href="/milk" className="flex-1 flex flex-col items-center justify-center py-3 px-2 text-gray-400">
            <Milk size={24} />
            <span className="text-lg mt-1 font-light">การรีดนม</span>
          </a>
          <a href="/settings" className="flex-1 flex flex-col items-center justify-center py-3 px-2 text-black">
            <Settings size={24} />
            <span className="text-lg mt-1 font-light">ตั้งค่า</span>
          </a>
        </div>
      </nav>
    </div>
  )
}