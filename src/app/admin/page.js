'use client'

import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    owner: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchFarms()
    }
  }, [isAuthenticated])

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setPasswordError('')

    if (adminPassword === 'P@ssw0rd') {
      setIsAuthenticated(true)
      setShowPasswordPrompt(false)
    } else {
      setPasswordError('รหัสผ่านไม่ถูกต้อง')
      setAdminPassword('')
    }
  }

  const fetchFarms = async () => {
    try {
      const response = await fetch('/api/farms')
      const data = await response.json()

      if (data.success) {
        setFarms(data.data)
      } else {
        setError('Failed to fetch farms')
      }
    } catch (error) {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || !formData.location || !formData.owner) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('สร้างฟาร์มสำเร็จ!')
        setFormData({ name: '', location: '', owner: '' })
        setShowForm(false)
        fetchFarms()
      } else {
        setError(data.error || 'Failed to create farm')
      }
    } catch (error) {
      setError('Connection error')
    }
  }

  const handleDelete = async (farmId) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบฟาร์มนี้?')) {
      return
    }

    try {
      const response = await fetch(`/api/farms/${farmId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('ลบฟาร์มสำเร็จ!')
        fetchFarms()
      } else {
        setError(data.error || 'Failed to delete farm')
      }
    } catch (error) {
      setError('Connection error')
    }
  }

  // Password protection popup
  if (showPasswordPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              เข้าสู่หน้า Admin
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              กรุณาป้อนรหัสผ่านเพื่อเข้าใช้งาน
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {passwordError}
              </div>
            )}

            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                รหัสผ่าน Admin
              </label>
              <input
                id="adminPassword"
                name="adminPassword"
                type="password"
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="รหัสผ่าน"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              จัดการฟาร์ม - Admin
            </h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              + เพิ่มฟาร์มใหม่
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">เพิ่มฟาร์มใหม่</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ชื่อฟาร์ม
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="ชื่อฟาร์ม"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ที่ตั้ง
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="ที่ตั้งฟาร์ม"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      เจ้าของฟาร์ม
                    </label>
                    <input
                      type="text"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="ชื่อเจ้าของฟาร์ม"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                    >
                      สร้างฟาร์ม
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {farms.map((farm) => (
              <div key={farm._id} className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {farm.name}
                </h3>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">ที่ตั้ง:</span> {farm.location}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">เจ้าของ:</span> {farm.owner}
                </p>
                <p className="text-gray-600 mb-4">
                  <span className="font-medium">สถานะ:</span>{' '}
                  <span className={farm.isActive ? 'text-green-600' : 'text-red-600'}>
                    {farm.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </p>

                <div className="bg-white p-3 rounded border">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">ข้อมูลล็อกอิน:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Owner:</span> {farm.name}-owner</p>
                    <p><span className="font-medium">Employee:</span> {farm.name}-employee</p>
                    <p><span className="font-medium">Password:</span> 123456</p>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleDelete(farm._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>

          {farms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีฟาร์มในระบบ
            </div>
          )}
        </div>
      </div>
    </div>
  )
}