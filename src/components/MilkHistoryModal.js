import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, Loader2, Edit3, Trash2, ChevronDown, ChevronRight, Sun, Moon, Check } from 'lucide-react'
import Avatar from './Avatar'
import Button from './Button'
import { useMilkRecords } from '../hooks/useMilkRecords'

export default function MilkHistoryModal({
  isOpen,
  onClose,
  selectedDate
}) {
  const [filteredHistory, setFilteredHistory] = useState([])
  const [groupedByCow, setGroupedByCow] = useState({})
  const [expandedCows, setExpandedCows] = useState(new Set())
  const [editingRecord, setEditingRecord] = useState(null)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  // Use the existing hook to fetch records for the selected date
  const { records, loading, updateRecord, deleteRecord } = useMilkRecords(selectedDate)

  // Filter and group history records by cow
  useEffect(() => {
    if (!records) {
      setFilteredHistory([])
      setGroupedByCow({})
      return
    }

    const filtered = [...records]

    // Group by cow
    const groupedByCow = {}
    filtered.forEach(record => {
      const cowId = record.cowId._id
      if (!groupedByCow[cowId]) {
        groupedByCow[cowId] = {
          cow: record.cowId,
          date: record.date,
          morning: [],
          evening: [],
          totalMilk: 0,
          totalRecords: 0
        }
      }

      groupedByCow[cowId][record.session].push(record)
      groupedByCow[cowId].totalMilk += record.milkAmount
      groupedByCow[cowId].totalRecords += 1
    })

    // Sort records within each session by time
    Object.values(groupedByCow).forEach(cowData => {
      cowData.morning.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      cowData.evening.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    })

    setFilteredHistory(filtered)
    setGroupedByCow(groupedByCow)
  }, [records])

  // Toggle cow expansion
  const toggleCowExpansion = (cowId) => {
    const newExpanded = new Set(expandedCows)
    if (newExpanded.has(cowId)) {
      newExpanded.delete(cowId)
    } else {
      newExpanded.add(cowId)
    }
    setExpandedCows(newExpanded)
  }

  // Handle edit record
  const handleEditRecord = (record) => {
    setEditingRecord({ ...record, milkAmount: record.milkAmount.toString() })
    setErrors({})
  }

  // Handle update record
  const handleUpdateRecord = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!editingRecord.milkAmount || editingRecord.milkAmount <= 0 || editingRecord.milkAmount > 100) {
      setErrors({ editMilkAmount: 'ปริมาณนมต้องอยู่ระหว่าง 0.1-100 กก.' })
      return
    }

    const result = await updateRecord(editingRecord._id, {
      milkAmount: parseFloat(editingRecord.milkAmount)
    })

    if (result.success) {
      setEditingRecord(null)
      setSuccessMessage('อัปเดตข้อมูลเรียบร้อยแล้ว')
      setTimeout(() => setSuccessMessage(''), 3000)
    } else {
      setErrors({ editSubmit: result.error || 'เกิดข้อผิดพลาดในการอัปเดต' })
    }
  }

  // Handle delete record
  const handleDeleteRecord = async (recordId) => {
    if (confirm('คุณต้องการลบบันทึกนี้หรือไม่?')) {
      const result = await deleteRecord(recordId)
      if (result.success) {
        setSuccessMessage('ลบบันทึกเรียบร้อยแล้ว')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrors({ submit: result.error || 'เกิดข้อผิดพลาดในการลบ' })
      }
    }
  }

  // Record Edit Form Component
  const RecordEditForm = ({ record, editingRecord, setEditingRecord, errors, loading, onSubmit, onCancel }) => (
    <div className={`py-4 px-4 ${record.session === 'evening' ? 'bg-blue-50/30' : 'bg-orange-50/30'} backdrop-blur-sm`}>
      <form onSubmit={onSubmit}>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {record.session === 'evening' ? (
                <Moon size={18} className="text-blue-500" />
              ) : (
                <Sun size={18} className="text-orange-500" />
              )}
              <span className="text-lg text-gray-400 font-thin w-16">
                {new Date(record.createdAt).toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Bangkok'
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={editingRecord.milkAmount}
                onChange={(e) => setEditingRecord(prev => ({ ...prev, milkAmount: e.target.value }))}
                className={`w-28 border-2 bg-yellow-50 rounded-xl px-3 py-2 text-right text-lg font-semibold shadow-md focus:ring-2 focus:outline-none ${
                  errors.editMilkAmount ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-blue-400 focus:ring-blue-300'
                }`}
              />
              <span className="text-lg text-gray-400 font-thin">กก.</span>
            </div>
          </div>
          <div className="flex items-center justify-between space-x-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 text-gray-700 font-semibold hover:text-gray-900 rounded-xl px-4 py-2 shadow-md"
            >
              <X size={16} />
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 font-semibold rounded-xl px-4 py-2 shadow-lg"
            >
              <Check size={16} />
              บันทึก
            </Button>
          </div>
        </div>
        {(errors.editMilkAmount || errors.editSubmit) && (
          <div className="text-lg font-thin text-gray-500 mt-2">
            {errors.editMilkAmount || errors.editSubmit}
          </div>
        )}
      </form>
    </div>
  )

  // Record Display Row Component
  const RecordDisplayRow = ({ record, loading, onEdit, onDelete }) => {
    const isEvening = record.session === 'evening'
    const bgColor = isEvening ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-25 hover:bg-gray-50'

    return (
      <div className={`flex items-center justify-between py-3 px-4 ${bgColor}`}>
        <div className="flex items-center space-x-4">
          {isEvening ? (
            <Moon size={18} className="text-blue-500" />
          ) : (
            <Sun size={18} className="text-orange-500" />
          )}
          <span className="text-lg text-gray-400 font-thin w-16">
            {new Date(record.createdAt).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Bangkok'
            })}
          </span>
          <span className="font-light text-xl text-black">
            {record.milkAmount} กก.
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onEdit(record)}
            variant="ghost"
            size="sm"
            disabled={loading}
            icon={<Edit3 size={16} className="stroke-1" />}
            className="text-gray-300 hover:text-gray-500 p-1"
          />
          <Button
            onClick={() => onDelete(record._id)}
            variant="ghost"
            size="sm"
            disabled={loading}
            icon={<Trash2 size={16} className="stroke-1" />}
            className="text-gray-300 hover:text-red-400 p-1"
          />
        </div>
      </div>
    )
  }

  // Format date for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00')
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
    const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                       'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
    const dayOfWeek = dayNames[date.getDay()]
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear() + 543 // Convert to Buddhist Era
    return `วัน${dayOfWeek}ที่ ${day} ${month} ${year}`
  }


  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999]" style={{ zIndex: 9999 }}>
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 transition-opacity"
        onClick={onClose}
      />

      {/* Modal panel - Full screen on mobile */}
      <div className="fixed inset-0 bg-white transform transition-all overflow-y-auto z-[100]">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 p-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-light text-gray-800">ประวัติการรีดนม</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              icon={<X size={16} className="stroke-1" />}
              className="text-gray-400 hover:text-gray-600 p-1"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-20">
          {/* Summary */}
          {filteredHistory && filteredHistory.length > 0 && (
            (() => {
              const morningRecords = filteredHistory.filter(record => record.session === 'morning')
              const eveningRecords = filteredHistory.filter(record => record.session === 'evening')
              const morningMilk = morningRecords.reduce((sum, record) => sum + record.milkAmount, 0)
              const eveningMilk = eveningRecords.reduce((sum, record) => sum + record.milkAmount, 0)
              const totalMilk = morningMilk + eveningMilk

              return (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-0 shadow-[0_8px_32px_rgba(0,0,0,0.08)] mb-6 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-50/30 via-white/50 to-green-50/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar size={18} className="text-blue-500" />
                        <div className="font-light text-lg text-gray-900">{formatDisplayDate(selectedDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                          <Sun size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-gray-900">{morningMilk.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">เช้า • {morningRecords.length} ตัว</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <Moon size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-gray-900">{eveningMilk.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">เย็น • {eveningRecords.length} ตัว</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                          <Calendar size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-gray-900">{totalMilk.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">รวมทั้งวัน</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50/90 backdrop-blur-sm border border-green-200/50 text-green-700 px-4 py-3 rounded-2xl mb-4 text-sm font-medium shadow-sm">
              {successMessage}
            </div>
          )}

          {/* History Results */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-0 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 size={32} className="animate-spin mx-auto text-gray-400" />
                <p className="mt-3 text-sm font-medium text-gray-500">กำลังโหลดข้อมูล...</p>
              </div>
            ) : Object.keys(groupedByCow).length === 0 ? (
              <div className="p-8 text-center">
                <Calendar size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">ไม่พบข้อมูลในวันที่เลือก</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {Object.values(groupedByCow)
                  .sort((a, b) => b.totalMilk - a.totalMilk)
                  .map((cowData, index) => {
                    const isExpanded = expandedCows.has(cowData.cow._id)
                    const rank = index + 1

                    return (
                      <div key={cowData.cow._id} className="bg-white/60 backdrop-blur-sm rounded-2xl border-0 shadow-sm overflow-hidden">
                        {/* Cow Summary Card */}
                        <Button
                          onClick={() => toggleCowExpansion(cowData.cow._id)}
                          variant="ghost"
                          size="md"
                          className="w-full p-4 bg-transparent hover:bg-white/50 transition-all duration-300 text-left flex items-center justify-between rounded-2xl"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-md">
                                <Avatar
                                  username={cowData.cow.name}
                                  size={32}
                                  className="rounded-lg"
                                />
                              </div>
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-xs font-bold text-white">{rank}</span>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{cowData.cow.name}</h3>
                              <div className="flex items-center space-x-2 text-sm font-medium">
                                {cowData.morning.length > 0 && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 rounded-full">
                                    <Sun size={12} />
                                    <span>เช้า</span>
                                  </span>
                                )}
                                {cowData.evening.length > 0 && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full">
                                    <Moon size={12} />
                                    <span>เย็น</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-light text-black">{cowData.totalMilk.toFixed(2)} กก.</span>
                            {isExpanded ? <ChevronDown size={18} className="stroke-1 text-gray-400" /> : <ChevronRight size={18} className="stroke-1 text-gray-400" />}
                          </div>
                        </Button>

                        {/* Expanded Records */}
                        {isExpanded && (
                          <div className="bg-gray-50/50 backdrop-blur-sm border-t border-gray-100/80">
                            {/* All records combined and sorted */}
                            {[...cowData.morning, ...cowData.evening]
                              .sort((a, b) => {
                                // Sort by session first (morning first), then by time
                                if (a.session !== b.session) {
                                  return a.session === 'morning' ? -1 : 1
                                }
                                return new Date(a.createdAt) - new Date(b.createdAt)
                              })
                              .map((record) => (
                                <div key={record._id}>
                                  {editingRecord?._id === record._id ? (
                                    <RecordEditForm
                                      record={record}
                                      editingRecord={editingRecord}
                                      setEditingRecord={setEditingRecord}
                                      errors={errors}
                                      loading={loading}
                                      onSubmit={handleUpdateRecord}
                                      onCancel={() => setEditingRecord(null)}
                                    />
                                  ) : (
                                    <RecordDisplayRow
                                      record={record}
                                      loading={loading}
                                      onEdit={handleEditRecord}
                                      onDelete={handleDeleteRecord}
                                    />
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Use portal to render modal at document body level
  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent
}