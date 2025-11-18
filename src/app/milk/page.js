'use client'

import { useState, useEffect } from 'react'
import { Milk, Settings, Sun, Moon, Clock, Droplets, History , Calendar } from 'lucide-react'
import { useFarms } from '../../hooks/useFarms'
import { useCows } from '../../hooks/useCows'
import { useMilkRecords } from '../../hooks/useMilkRecords'
import { formatThaiDate, getCurrentSession, getTodayThailand } from '../../lib/datetime'
import MilkRecordTab from '../../components/MilkRecordTab'
import MilkHistoryTab from '../../components/MilkHistoryTab'
import BackdateModal from '../../components/BackdateModal'
import BottomNavigation from '../../components/BottomNavigation'
import Button from '../../components/Button'
import Avatar from '../../components/Avatar'

export default function MilkPage() {
  const [activeTab, setActiveTab] = useState('record') // 'record' or 'history'
  const [selectedSession, setSelectedSession] = useState(() => getCurrentSession())
  const [selectedFarmId, setSelectedFarmId] = useState(null)
  const [newRecord, setNewRecord] = useState({ cowId: '', milkAmount: '' })
  const [editingRecord, setEditingRecord] = useState(null)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [historyFilters, setHistoryFilters] = useState({
    selectedDate: getTodayThailand(),
    searchTerm: ''
  })
  const [showBackdateModal, setShowBackdateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Hooks
  const { farms, loading: farmsLoading } = useFarms()
  const { cows } = useCows(selectedFarmId)
  const { records, sessions, loading: recordsLoading, error: recordsError, createRecord, updateRecord, deleteRecord, getRecordsBySession } = useMilkRecords(selectedFarmId, historyFilters.selectedDate)

  // Set default farm when farms load
  useEffect(() => {
    if (farms.length > 0 && !selectedFarmId) {
      setSelectedFarmId(farms[0]._id)
    }
  }, [farms, selectedFarmId])

  // Handle create record
  const handleCreateRecord = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')
    setSubmitting(true)

    try {
      // Validation
      if (!selectedFarmId) {
        setErrors({ submit: 'กรุณาเลือกฟาร์มก่อน' })
        return
      }

      if (!newRecord.cowId) {
        setErrors({ cowId: 'กรุณาเลือกโค' })
        return
      }

      if (!newRecord.milkAmount || newRecord.milkAmount <= 0 || newRecord.milkAmount > 100) {
        setErrors({ milkAmount: 'ปริมาณนมต้องอยู่ระหว่าง 0.01-100 กก.' })
        return
      }

      const sessionData = sessions[selectedSession]
      if (!sessionData) {
        setErrors({ submit: 'ไม่พบข้อมูลรอบ กรุณาลองใหม่อีกครั้ง' })
        return
      }

      const result = await createRecord({
        sessionId: sessionData._id,
        cowId: newRecord.cowId,
        session: selectedSession,
        milkAmount: parseFloat(newRecord.milkAmount)
      })

      if (result.success) {
        setNewRecord({ cowId: '', milkAmount: '' })
        setSuccessMessage('บันทึกข้อมูลสำเร็จ!')
        setTimeout(() => setSuccessMessage(''), 2000)
      } else {
        setErrors({ submit: result.error || 'เกิดข้อผิดพลาดในการบันทึก' })
      }
    } finally {
      setSubmitting(false)
    }
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
      setErrors({ editMilkAmount: 'ปริมาณนมต้องอยู่ระหว่าง 0.01-100 กก.' })
      return
    }

    const result = await updateRecord(editingRecord._id, {
      milkAmount: parseFloat(editingRecord.milkAmount)
    })

    if (result.success) {
      setEditingRecord(null)
      setSuccessMessage('อัปเดตสำเร็จ!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } else {
      setErrors({ editSubmit: result.error || 'เกิดข้อผิดพลาดในการอัปเดต' })
    }
  }

  // Handle delete record
  const handleDeleteRecord = async (recordId) => {
    const result = await deleteRecord(recordId)
    if (result.success) {
      setSuccessMessage('ลบสำเร็จ!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } else {
      setErrors({ submit: result.error || 'เกิดข้อผิดพลาดในการลบ' })
    }
  }

  // Get available cows for specific session (exclude already recorded)
  const getAvailableCows = (session = selectedSession) => {
    const recordedCowIds = getRecordsBySession(session).map(record => record.cowId._id)
    return cows.filter(cow => !recordedCowIds.includes(cow._id))
  }

  // Check if current session is completed
  const isSessionComplete = (session = selectedSession) => {
    return getAvailableCows(session).length === 0 && cows.length > 0
  }

  const sessionRecords = getRecordsBySession(selectedSession)
  const sessionData = sessions[selectedSession]
  const availableCows = getAvailableCows()

  // Calculate session totals for badges
  const morningTotal = getRecordsBySession('morning').reduce((sum, record) => sum + record.milkAmount, 0)
  const eveningTotal = getRecordsBySession('evening').reduce((sum, record) => sum + record.milkAmount, 0)


  // Handle opening backdate modal
  const handleOpenBackdateModal = () => {
    setShowBackdateModal(true)
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Modern Glass Header */}
      {/* <header className="bg-white/80 backdrop-blur-xl border-b-0 shadow-[0_8px_32px_rgba(0,0,0,0.08)] sticky top-0" style={{ zIndex: 9999 }}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Milk size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                การรีดนม
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleOpenBackdateModal}
                variant="secondary"
                size="sm"
                className="font-medium bg-white/60 hover:bg-white/80 border-white/20 backdrop-blur-sm shadow-sm"
                icon={<Clock size={14} />}
              >
                บันทึกย้อนหลัง
              </Button>
            </div>
          </div>
        </div>
      </header> */}

      {/* Modern Glass Tab Navigation */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] sticky top-0" style={{ zIndex: 9998 }}>
        <div className="px-4 py-3">
          <div className="flex relative">
            <button
              onClick={() => setActiveTab('record')}
              className={`flex-1 flex items-center justify-center space-x-3 py-3 text-xl font-light transition-all duration-300 relative ${
                activeTab === 'record'
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Droplets size={18} />
              <span>รีดนมวันนี้</span>
              {activeTab === 'record' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center space-x-3 py-3 text-xl font-light transition-all duration-300 relative ${
                activeTab === 'history'
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <History size={18} />
              <span>ประวัติ</span>
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
              )}
            </button>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="p-4 pb-20 md:pb-4" style={{ position: 'relative', zIndex: 5 }}>
        <div className="max-w-2xl mx-auto">
          {activeTab === 'record' ? (
            <MilkRecordTab
              selectedFarmId={selectedFarmId}
              selectedSession={selectedSession}
              cows={cows}
              availableCows={availableCows}
              editingRecord={editingRecord}
              setEditingRecord={setEditingRecord}
              errors={errors}
              recordsError={recordsError}
              recordsLoading={recordsLoading}
              sessionRecords={sessionRecords}
              records={records}
              handleEditRecord={handleEditRecord}
              handleUpdateRecord={handleUpdateRecord}
              handleDeleteRecord={handleDeleteRecord}
            />
          ) : (
            <MilkHistoryTab
              records={records}
              cows={cows}
              loading={recordsLoading}
              updateRecord={updateRecord}
              deleteRecord={deleteRecord}
              historyFilters={historyFilters}
            />
          )}
        </div>
      </div>

      {/* Modern Glass Quick Add Form - Fixed Bottom */}
      {activeTab === 'record' && selectedFarmId && (
        <div className="fixed bottom-20 left-0 right-0 bg-white/90 backdrop-blur-xl border-t-0 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] z-10">
          <div className="p-4 max-w-2xl mx-auto">
            {/* Modern Session Toggle */}
            <div className="flex bg-gray-100/60 rounded-2xl p-0.5 mb-2 backdrop-blur-sm">
              <div className="flex-1 relative">
                <Button
                  onClick={() => setSelectedSession('morning')}
                  variant="ghost"
                  size="sm"
                  className={`w-full rounded-xl py-1.5 transition-all duration-300 ${
                    selectedSession === 'morning'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  icon={<Sun size={16} className={`${selectedSession === 'morning' ? 'text-white' : 'text-orange-500'}`} />}
                >
                  รอบเช้า
                </Button>
                {morningTotal > 0 && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[28px] text-center shadow-lg z-20">
                    {morningTotal.toFixed(2)}
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                <Button
                  onClick={() => setSelectedSession('evening')}
                  variant="ghost"
                  size="sm"
                  className={`w-full rounded-xl py-1.5 transition-all duration-300 ${
                    selectedSession === 'evening'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  icon={<Moon size={16} className={`${selectedSession === 'evening' ? 'text-white' : 'text-blue-500'}`} />}
                >
                  รอบเย็น
                </Button>
                {eveningTotal > 0 && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[28px] text-center shadow-lg z-20">
                    {eveningTotal.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* Modern Glass Form */}
            {!isSessionComplete() && (
              <div className="bg-white/90 backdrop-blur-xl p-2">
                <form onSubmit={handleCreateRecord} className="flex flex-col space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={newRecord.cowId}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, cowId: e.target.value }))}
                      className={`bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl px-3 py-3 text-lg font-light shadow-md focus:ring-2 focus:ring-blue-500/50 focus:bg-white focus:border-blue-300/50 h-12 transition-all duration-200 ${
                        errors.cowId ? 'ring-2 ring-red-400/50 bg-red-50/80 border-red-300/50' : ''
                      }`}
                      disabled={recordsLoading || submitting}
                    >
                      <option value="">เลือกโค</option>
                      {availableCows.map((cow) => (
                        <option key={cow._id} value={cow._id}>
                          {cow.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="100"
                      placeholder="ปริมาณนม (กก.)"
                      value={newRecord.milkAmount}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, milkAmount: e.target.value }))}
                      className={`bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl px-3 py-3 text-right text-lg font-light shadow-md focus:ring-2 focus:ring-blue-500/50 focus:bg-white focus:border-blue-300/50 h-12 transition-all duration-200 ${
                        errors.milkAmount ? 'ring-2 ring-red-400/50 bg-red-50/80 border-red-300/50' : ''
                      }`}
                      disabled={recordsLoading || submitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={recordsLoading || submitting || !selectedFarmId}
                    loading={submitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 font-bold h-12 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    บันทึก
                  </Button>
                </form>
              </div>
            )}

            {/* Modern Completion Message */}
            {isSessionComplete() && (
              <div className="bg-green-50/60 backdrop-blur-sm border-0 text-green-700 px-4 py-3 rounded-xl text-center shadow-sm">
                <div className="flex items-center justify-center space-x-1.5">
                  <svg className="w-4 h-4 stroke-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-light text-lg">
                    บันทึกรอบ{selectedSession === 'morning' ? 'เช้า' : 'เย็น'}ครบหมดแล้ว
                  </span>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {(errors.cowId || errors.milkAmount || errors.submit) && (
              <div className="mt-2 text-lg font-light text-gray-600">
                {errors.cowId || errors.milkAmount || errors.submit}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Filter Form - Fixed Bottom */}
      {activeTab === 'history' && (
        <div className="fixed bottom-20 left-4 right-4 bg-white/90 backdrop-blur-xl border-t border-white/20 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] z-10 rounded-t-3xl">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <input
                type="date"
                max={getTodayThailand()}
                value={historyFilters.selectedDate}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, selectedDate: e.target.value, searchTerm: '' }))}
                className="flex-none w-40 border border-gray-200 bg-white rounded-xl px-4 py-3 text-lg font-light shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:outline-none transition-all duration-300"
              />

              <input
                type="text"
                placeholder="ค้นหาชื่อโค"
                value={historyFilters.searchTerm}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="flex-1 min-w-0 border border-gray-200 bg-white rounded-xl px-4 py-3 text-lg font-light shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Backdate Modal Component */}
      <BackdateModal
        showBackdateModal={showBackdateModal}
        setShowBackdateModal={setShowBackdateModal}
        selectedFarmId={selectedFarmId}
        cows={cows}
      />



      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black text-white px-4 py-2 rounded shadow-sm flex items-center space-x-1.5">
            <svg className="w-4 h-4 stroke-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-light text-lg">{successMessage}</span>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  )
}