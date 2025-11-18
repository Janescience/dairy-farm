'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit3, Trash2, Loader2 } from 'lucide-react'
import Avatar from '../../../components/Avatar'
import BottomNavigation from '../../../components/BottomNavigation'
import Button from '../../../components/Button'

export default function CowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cowId = params.id

  const [cow, setCow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(true) // Always in edit mode
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    birthDate: '',
    entryDate: '',
    purchasePrice: ''
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const fetchCow = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cows/${cowId}`)
      const result = await response.json()

      if (result.success) {
        console.log('Cow data from API:', result.data)
        setCow(result.data)
        setFormData({
          name: result.data.name || '',
          age: result.data.age || '',
          gender: result.data.gender || '',
          birthDate: result.data.birthDate ? result.data.birthDate.split('T')[0] : '',
          entryDate: result.data.entryDate ? result.data.entryDate.split('T')[0] : '',
          purchasePrice: result.data.purchasePrice || ''
        })
        console.log('Form data set to:', {
          name: result.data.name || '',
          age: result.data.age || '',
          gender: result.data.gender || '',
          birthDate: result.data.birthDate ? result.data.birthDate.split('T')[0] : '',
          entryDate: result.data.entryDate ? result.data.entryDate.split('T')[0] : '',
          purchasePrice: result.data.purchasePrice || ''
        })
      } else {
        router.push('/settings')
      }
    } catch (error) {
      console.error('Error fetching cow:', error)
      router.push('/settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cowId) {
      fetchCow()
    }
  }, [cowId])

  const handleCancel = () => {
    setErrors({})
    if (cow) {
      setFormData({
        name: cow.name || '',
        age: cow.age || '',
        gender: cow.gender || '',
        birthDate: cow.birthDate ? cow.birthDate.split('T')[0] : '',
        entryDate: cow.entryDate ? cow.entryDate.split('T')[0] : '',
        purchasePrice: cow.purchasePrice || ''
      })
    }
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return ''
    const today = new Date()
    const birth = new Date(birthDate)
    const ageInMs = today - birth
    const ageInYears = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000))
    return ageInYears
  }

  const calculateDaysOwned = (entryDate) => {
    if (!entryDate) return ''
    const today = new Date()
    const entry = new Date(entryDate)
    const diffInMs = today - entry
    const diffInDays = Math.floor(diffInMs / (24 * 60 * 60 * 1000))

    const years = Math.floor(diffInDays / 365)
    const remainingDays = diffInDays % 365

    if (years > 0) {
      return `${years}ปี ${remainingDays}วัน`
    } else {
      return `${diffInDays}วัน`
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!confirm('คุณต้องการบันทึกการเปลี่ยนแปลงหรือไม่?')) {
      return
    }

    setErrors({})

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: 'กรุณาระบุชื่อโค' })
      return
    }

    try {
      console.log('Submitting data:', {
        name: formData.name.trim(),
        age: formData.birthDate ? calculateAge(formData.birthDate) : undefined,
        gender: formData.gender || undefined,
        birthDate: formData.birthDate || undefined,
        entryDate: formData.entryDate || undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined
      })

      const response = await fetch(`/api/cows/${cowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          age: formData.birthDate ? calculateAge(formData.birthDate) : undefined,
          gender: formData.gender || undefined,
          birthDate: formData.birthDate || undefined,
          entryDate: formData.entryDate || undefined,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage('อัปเดตข้อมูลเรียบร้อยแล้ว')
        setTimeout(() => setSuccessMessage(''), 3000)
        fetchCow() // Refresh data
      } else {
        setErrors({ submit: result.error || 'เกิดข้อผิดพลาดในการอัปเดต' })
      }
    } catch (error) {
      setErrors({ submit: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    }
  }

  const handleDelete = async () => {
    if (confirm('คุณต้องการลบโคนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      try {
        const response = await fetch(`/api/cows/${cowId}`, {
          method: 'DELETE'
        })

        const result = await response.json()

        if (result.success) {
          router.push('/settings?tab=cows&success=ลบโคเรียบร้อยแล้ว')
        } else {
          setErrors({ submit: result.error || 'เกิดข้อผิดพลาดในการลบ' })
        }
      } catch (error) {
        setErrors({ submit: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!cow) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">ไม่พบข้อมูลโค</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Modern Glass Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b-0 shadow-[0_8px_32px_rgba(0,0,0,0.08)] sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                รายละเอียดโค
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 pb-32">
        <div className="max-w-2xl mx-auto">

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


          {/* Modern Glass Cow Details */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Profile Section */}
              <div className="flex items-start space-x-6 mb-8">
                <div className="flex-shrink-0">
                  <Avatar
                    username={formData.name || cow.name}
                    size={80}
                    className="rounded-2xl shadow-lg"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      ชื่อโค *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full border-0 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 text-xl font-semibold shadow-lg focus:ring-2 focus:outline-none focus:shadow-xl transition-all duration-300 ${
                        errors.name ? 'focus:ring-red-300 bg-red-50/50' : 'focus:ring-blue-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      เพศ
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full border-0 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 text-lg font-medium shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none focus:shadow-xl transition-all duration-300"
                    >
                      <option value="">เลือกเพศ</option>
                      <option value="female">เมีย</option>
                      <option value="male">ผู้</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Birth Date & Age */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    วันเกิด
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full border-0 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 text-lg font-medium shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none focus:shadow-xl transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    อายุ (ปี)
                  </label>
                  <div className="w-full bg-gray-100/90 backdrop-blur-sm rounded-xl px-4 py-3 text-lg font-medium text-gray-600 shadow-lg">
                    {formData.birthDate ? calculateAge(formData.birthDate) : '-'}
                  </div>
                </div>
              </div>

              {/* Entry Date & Days Owned */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    วันนำเข้า
                  </label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, entryDate: e.target.value }))}
                    className="w-full border-0 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 text-lg font-medium shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none focus:shadow-xl transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    เลี้ยงดู
                  </label>
                  <div className="w-full bg-gray-100/90 backdrop-blur-sm rounded-xl px-4 py-3 text-lg font-medium text-gray-600 shadow-lg">
                    {formData.entryDate ? calculateDaysOwned(formData.entryDate) : '-'}
                  </div>
                </div>
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  ราคาซื้อ (บาท)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  className="w-full border-0 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 text-lg font-medium shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none focus:shadow-xl transition-all duration-300"
                  placeholder="0.00"
                />
              </div>

              {/* Modern Error Message */}
              {errors.submit && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium shadow-sm">
                  {errors.submit}
                </div>
              )}


            </form>
          </div>
        </div>
      </div>

      {/* Modern Action Buttons - Fixed Bottom */}
      <div className="fixed bottom-20 left-4 right-4 bg-white/90 backdrop-blur-xl border border-white/30 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] rounded-t-3xl z-40">
        <div className="p-5">
          <div className="flex space-x-3">
            <Button
              onClick={handleDelete}
              variant="danger"
              size="lg"
              icon={<Trash2 size={16} />}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 font-semibold rounded-xl px-4 py-3 shadow-lg"
            >
              ลบ
            </Button>
            <Button
              onClick={() => {
                const form = document.querySelector('form')
                if (form) form.requestSubmit()
              }}
              variant="primary"
              size="lg"
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 font-semibold rounded-xl px-4 py-3 shadow-lg"
            >
              บันทึก
            </Button>
            <Button
              onClick={() => router.push('/settings?tab=cows')}
              variant="secondary"
              size="lg"
              icon={<ArrowLeft size={16} />}
              className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold hover:text-gray-900 rounded-xl px-4 py-3 shadow-md"
            >
              กลับ
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}