import { useState, useEffect } from 'react'
import { X, Calendar, Plus, Check, Sun, Moon, TrendingUp } from 'lucide-react'
import Avatar from './Avatar'
import Button from './Button'

export default function BackdateModal({
  showBackdateModal,
  setShowBackdateModal,
  cows,
  preSelectedDate = null,
  onBack = null
}) {
  const [backdateData, setBackdateData] = useState({ date: '', records: [] })
  const [backdateExistingRecords, setBackdateExistingRecords] = useState([])
  const [loadingBackdateCheck, setLoadingBackdateCheck] = useState(false)
  const [errors, setErrors] = useState({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [submittingBackdate, setSubmittingBackdate] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)

  // Helper functions
  const getTodayThailand = () => {
    return new Date().toISOString().split('T')[0]
  }

  const getYesterdayThailand = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }

  const getNowThailand = () => {
    return new Date()
  }

  // Initialize modal when opened
  useEffect(() => {
    if (showBackdateModal) {
      const defaultDate = preSelectedDate || getYesterdayThailand()
      setBackdateData({ date: defaultDate, records: [] })
      setBackdateExistingRecords([])
      setErrors({})
      setHasUnsavedChanges(false)
      // Auto-load data for selected/yesterday date
      handleBackdateDateChange(defaultDate)
    }
  }, [showBackdateModal, preSelectedDate])

  // Reset modal data when closed
  useEffect(() => {
    if (!showBackdateModal) {
      setBackdateData({ date: '', records: [] })
      setBackdateExistingRecords([])
      setErrors({})
      setHasUnsavedChanges(false)
      setShowConfirmation(false)
      setShowCancelConfirmation(false)
    }
  }, [showBackdateModal])

  // Handle date change for backdate
  const handleBackdateDateChange = async (newDate) => {
    setLoadingBackdateCheck(true)
    setErrors({})

    try {
      // ดึงข้อมูลที่บันทึกไปแล้วในวันที่เลือก
      const response = await fetch(`/api/milk-records?date=${newDate}`)
      const result = await response.json()

      if (result.success) {
        setBackdateExistingRecords(result.data)

        // หาโคที่ยังบันทึกไม่ครบ (ไม่มีทั้งเช้าและเย็น)
        const cowsNeedingRecords = []

        for (const cow of cows) {
          const existingMorning = result.data.find(record =>
            record.cowId._id === cow._id && record.session === 'morning'
          )
          const existingEvening = result.data.find(record =>
            record.cowId._id === cow._id && record.session === 'evening'
          )

          // ถ้ายังไม่มีการบันทึกเลย หรือมีแค่รอบเดียว ให้เพิ่มเข้าไป
          if (!existingMorning || !existingEvening) {
            cowsNeedingRecords.push({
              cowId: cow._id,
              cowName: cow.name,
              morning: existingMorning ? existingMorning.milkAmount.toString() : '',
              evening: existingEvening ? existingEvening.milkAmount.toString() : '',
              hasMorning: !!existingMorning,
              hasEvening: !!existingEvening
            })
          }
        }

        setBackdateData(prev => ({
          ...prev,
          date: newDate,
          records: cowsNeedingRecords
        }))
        setHasUnsavedChanges(false) // Reset unsaved changes when date changes
      }
    } catch (error) {
      console.error('Error fetching backdate records:', error)
      setErrors({ backdate: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' })
    } finally {
      setLoadingBackdateCheck(false)
    }
  }

  // Handle record change
  const handleBackdateRecordChange = (cowId, session, value) => {
    setBackdateData(prev => ({
      ...prev,
      records: prev.records.map(record =>
        record.cowId === cowId ? { ...record, [session]: value } : record
      )
    }))
    setHasUnsavedChanges(true)
  }

  // Handle add cow to backdate
  const handleAddCowToBackdate = () => {
    const availableCows = cows.filter(cow =>
      !backdateData.records.some(record => record.cowId === cow._id)
    )

    if (availableCows.length === 0) {
      setErrors({ backdate: 'โคทุกตัวอยู่ในรายการแล้ว' })
      setTimeout(() => setErrors({}), 3000)
      return
    }

    // Add first available cow
    const cow = availableCows[0]
    setBackdateData(prev => ({
      ...prev,
      records: [...prev.records, {
        cowId: cow._id,
        cowName: cow.name,
        morning: '',
        evening: '',
        hasMorning: false,
        hasEvening: false
      }]
    }))
    setHasUnsavedChanges(true)
  }

  // Handle remove cow from backdate
  const handleRemoveCowFromBackdate = (cowId) => {
    setBackdateData(prev => ({
      ...prev,
      records: prev.records.filter(record => record.cowId !== cowId)
    }))
    setHasUnsavedChanges(true)
  }

  // Handle cancel with confirmation
  const handleCancel = () => {
    // Check if there are any unsaved changes
    const hasAnyData = backdateData.records.some(record => {
      const hasNewMorning = !record.hasMorning && record.morning && parseFloat(record.morning) > 0
      const hasNewEvening = !record.hasEvening && record.evening && parseFloat(record.evening) > 0
      return hasNewMorning || hasNewEvening
    })

    if (hasAnyData) {
      setShowCancelConfirmation(true)
    } else {
      // Go back to CalendarView if onBack function provided, otherwise close modal
      if (onBack) {
        onBack()
      } else {
        setShowBackdateModal(false)
      }
    }
  }

  // Confirm cancel - go back without saving
  const confirmCancel = () => {
    setShowCancelConfirmation(false)
    // Go back to CalendarView if onBack function provided, otherwise close modal
    if (onBack) {
      onBack()
    } else {
      setShowBackdateModal(false)
    }
  }

  // Handle submit
  const handleBackdateSubmit = () => {
    // Validate data - เช็คเฉพาะช่องที่ยังไม่ได้บันทึกและมีข้อมูล
    const validRecords = backdateData.records.filter(record => {
      const hasNewMorning = !record.hasMorning && record.morning && parseFloat(record.morning) > 0
      const hasNewEvening = !record.hasEvening && record.evening && parseFloat(record.evening) > 0
      return hasNewMorning || hasNewEvening
    })

    if (validRecords.length === 0) {
      setErrors({ backdate: 'กรุณาระบุปริมาณน้ำนมอย่างน้อย 1 รายการ' })
      return
    }

    setShowConfirmation(true)
  }

  // Handle confirm
  const handleConfirmBackdate = async () => {
    try {
      setErrors({})
      setSubmittingBackdate(true)

      // Prepare bulk records - เฉพาะรอบที่ยังไม่ได้บันทึก
      const bulkRecords = []

      for (const record of backdateData.records) {
        // เพิ่มรอบเช้าถ้ายังไม่เคยบันทึกและมีข้อมูล
        if (!record.hasMorning && record.morning && parseFloat(record.morning) > 0) {
          bulkRecords.push({
            cowId: record.cowId,
            session: 'morning',
            milkAmount: parseFloat(record.morning)
          })
        }
        // เพิ่มรอบเย็นถ้ายังไม่เคยบันทึกและมีข้อมูล
        if (!record.hasEvening && record.evening && parseFloat(record.evening) > 0) {
          bulkRecords.push({
            cowId: record.cowId,
            session: 'evening',
            milkAmount: parseFloat(record.evening)
          })
        }
      }

      // Call bulk API
      if (bulkRecords.length > 0) {
        const response = await fetch('/api/milk-records/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: backdateData.date,
            records: bulkRecords
          }),
        })

        const result = await response.json()

        if (result.success) {
          // Close modal and reset state
          setShowBackdateModal(false)
          setShowConfirmation(false)
          setBackdateData({ date: '', records: [] })
          setBackdateExistingRecords([])
          setHasUnsavedChanges(false)
        } else {
          setErrors({ backdate: result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' })
        }
      }
    } catch (error) {
      console.error('Error submitting backdate records:', error)
      setErrors({ backdate: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' })
    } finally {
      setSubmittingBackdate(false)
    }
  }

  if (!showBackdateModal) return null

  return (
    <div className="fixed inset-0 z-[99999]">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={() => !submittingBackdate && setShowBackdateModal(false)}
      ></div>

      {/* Modal panel - Full screen with modern glass */}
      <div className="fixed inset-0 bg-white/95 backdrop-blur-xl transform transition-all overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-[0_1px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">บันทึกย้อนหลัง</h2>
                <p className="text-sm text-gray-500">เพิ่มข้อมูลการรีดนม</p>
              </div>
            </div>
            <Button
              onClick={() => !submittingBackdate && setShowBackdateModal(false)}
              variant="ghost"
              size="sm"
              icon={<X size={20} className="stroke-1" />}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 p-2 rounded-xl transition-all duration-200"
              disabled={submittingBackdate}
            />
          </div>

          {/* Selected Date Display with Progress - moved to header */}
          {backdateData.date && (
            <div className="px-4 pb-4 space-y-3">
              <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 backdrop-blur-sm border border-white/30 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar size={12} className="text-white" />
                  </div>
                  <span className="text-base font-medium text-gray-800">
                    {new Date(backdateData.date + 'T00:00:00').toLocaleDateString('th-TH', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Progress indicator - always visible in header */}
              {!loadingBackdateCheck && (() => {
                const cowsWithData = backdateData.records.filter(record => {
                  const hasNewMorning = !record.hasMorning && record.morning && parseFloat(record.morning) > 0
                  const hasNewEvening = !record.hasEvening && record.evening && parseFloat(record.evening) > 0
                  return hasNewMorning || hasNewEvening
                })

                const totalNeeded = cows.filter(cow => {
                  const existingMorning = backdateExistingRecords.find(record =>
                    record.cowId._id === cow._id && record.session === 'morning'
                  )
                  const existingEvening = backdateExistingRecords.find(record =>
                    record.cowId._id === cow._id && record.session === 'evening'
                  )
                  return !existingMorning || !existingEvening
                }).length

                const progressPercentage = totalNeeded === 0 ? 100 : Math.round((cowsWithData.length / totalNeeded) * 100)

                // Dynamic colors based on progress
                const getProgressColor = (percent) => {
                  if (percent === 0) return 'from-gray-400 to-gray-500'
                  if (percent < 25) return 'from-red-400 to-red-500'
                  if (percent < 50) return 'from-orange-400 to-orange-500'
                  if (percent < 75) return 'from-yellow-400 to-yellow-500'
                  if (percent < 100) return 'from-blue-400 to-blue-500'
                  return 'from-green-400 to-green-500'
                }

                return (
                  <div className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/30 rounded-2xl p-3 shadow-sm">
                    <div className="space-y-3">
                      {/* Header with icon and text */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-5 h-5 bg-gradient-to-r ${getProgressColor(progressPercentage)} rounded-lg flex items-center justify-center`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 11l3 3L22 4"/>
                              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.91.37 4.14 1.02"/>
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            ความคืบหน้า: {cowsWithData.length} / {totalNeeded} โค
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 font-semibold">
                          {progressPercentage}%
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200/60 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getProgressColor(progressPercentage)} transition-all duration-500 ease-out`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px - 220px)' }}>
          {/* Error Message */}
          {errors.backdate && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-xl shadow-sm mb-6">
              <p className="text-sm font-medium">{errors.backdate}</p>
            </div>
          )}

          {/* Complete Message */}
          {!loadingBackdateCheck && backdateData.records.length === 0 && backdateData.date && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">บันทึกครบหมดแล้ว</h3>
              <p className="text-base text-gray-500">โคทุกตัวได้บันทึกข้อมูลครบทั้ง 2 รอบในวันนี้แล้ว</p>
            </div>
          )}

          {/* Cow Records */}
          {!loadingBackdateCheck && backdateData.records.length > 0 && (
            <div className="space-y-4">
              <div>

              </div>

              <div className="space-y-3">
                {backdateData.records.map((record, index) => (
                  <div key={record.cowId} className="group relative bg-white/95 backdrop-blur-xl rounded-2xl border-0 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden">

                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-green-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative p-3">
                      {/* Single row layout: Avatar, Name, Status, Inputs, Remove */}
                      <div className="flex items-center space-x-3">
                        {/* Avatar with ranking */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl shadow-sm flex items-center justify-center relative">
                            <Avatar
                              username={record.cowName}
                              size={32}
                              className="rounded-lg"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 border border-white rounded-full shadow-sm flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{index + 1}</span>
                            </div>
                          </div>
                        </div>

                        {/* Name and status - flexible width */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
                              {record.cowName}
                            </h3>
                            {/* Status badges inline */}
                            {record.hasMorning && (
                              <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-amber-100/60 text-amber-700 rounded text-xs font-medium">
                                <Sun size={6} className="stroke-2" />
                                <span>เช้า</span>
                              </div>
                            )}
                            {record.hasEvening && (
                              <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-blue-100/60 text-blue-700 rounded text-xs font-medium">
                                <Moon size={6} className="stroke-2" />
                                <span>เย็น</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Morning input - compact */}
                        <div className="flex-shrink-0 w-20">
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={record.morning}
                              onChange={(e) => handleBackdateRecordChange(record.cowId, 'morning', e.target.value)}
                              disabled={record.hasMorning}
                              placeholder="เช้า"
                              className={`
                                w-full px-2 py-1.5 rounded-lg border-0 shadow-sm ring-1 font-medium text-sm text-center transition-all duration-200
                                ${record.hasMorning
                                  ? 'bg-amber-50/60 ring-amber-200/60 text-amber-700 cursor-not-allowed'
                                  : record.morning
                                    ? 'bg-white ring-green-300/60 text-gray-900 shadow-md focus:ring-green-400 focus:ring-2'
                                    : 'bg-white/80 ring-gray-200/60 text-gray-500 hover:bg-white hover:ring-gray-300/60 focus:ring-blue-400 focus:ring-2'
                                }
                              `}
                            />
                            {record.hasMorning && (
                              <div className="absolute inset-y-0 right-1 flex items-center">
                                <div className="w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                                  <Check size={8} className="text-white stroke-2" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Evening input - compact */}
                        <div className="flex-shrink-0 w-20">
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={record.evening}
                              onChange={(e) => handleBackdateRecordChange(record.cowId, 'evening', e.target.value)}
                              disabled={record.hasEvening}
                              placeholder="เย็น"
                              className={`
                                w-full px-2 py-1.5 rounded-lg border-0 shadow-sm ring-1 font-medium text-sm text-center transition-all duration-200
                                ${record.hasEvening
                                  ? 'bg-blue-50/60 ring-blue-200/60 text-blue-700 cursor-not-allowed'
                                  : record.evening
                                    ? 'bg-white ring-green-300/60 text-gray-900 shadow-md focus:ring-green-400 focus:ring-2'
                                    : 'bg-white/80 ring-gray-200/60 text-gray-500 hover:bg-white hover:ring-gray-300/60 focus:ring-blue-400 focus:ring-2'
                                }
                              `}
                            />
                            {record.hasEvening && (
                              <div className="absolute inset-y-0 right-1 flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Check size={8} className="text-white stroke-2" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveCowFromBackdate(record.cowId)}
                          className="flex-shrink-0 w-6 h-6 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                        >
                          <X size={12} className="stroke-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating Add Cow Button - only show if there are missing cows */}
              {(() => {
                const availableCows = cows.filter(cow =>
                  !backdateData.records.some(record => record.cowId === cow._id)
                )

                if (availableCows.length === 0) return null

                return (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleAddCowToBackdate}
                      disabled={loadingBackdateCheck || submittingBackdate}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-blue-200/60 hover:border-blue-300/80 text-blue-600 hover:text-blue-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Plus size={12} className="text-white stroke-2" />
                      </div>
                      <span className="text-sm font-medium">เพิ่มโค ({availableCows.length} ตัว)</span>
                    </button>
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        {/* Fixed Bottom Controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-white/20 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
          {/* Summary - always visible above buttons */}
          {!loadingBackdateCheck && backdateData.records.length > 0 && (() => {
            const totalMorning = backdateData.records.reduce((sum, record) => {
              let morningAmount = 0
              if (record.hasMorning) {
                // ใช้ข้อมูลเดิมที่บันทึกไว้แล้ว
                const existingRecord = backdateExistingRecords.find(r =>
                  r.cowId._id === record.cowId && r.session === 'morning'
                )
                morningAmount = existingRecord ? existingRecord.milkAmount : 0
              } else if (record.morning) {
                // ใช้ข้อมูลใหม่ที่กรอกเข้ามา
                morningAmount = parseFloat(record.morning)
              }
              return sum + morningAmount
            }, 0)

            const totalEvening = backdateData.records.reduce((sum, record) => {
              let eveningAmount = 0
              if (record.hasEvening) {
                // ใช้ข้อมูลเดิมที่บันทึกไว้แล้ว
                const existingRecord = backdateExistingRecords.find(r =>
                  r.cowId._id === record.cowId && r.session === 'evening'
                )
                eveningAmount = existingRecord ? existingRecord.milkAmount : 0
              } else if (record.evening) {
                // ใช้ข้อมูลใหม่ที่กรอกเข้ามา
                eveningAmount = parseFloat(record.evening)
              }
              return sum + eveningAmount
            }, 0)

            const grandTotal = totalMorning + totalEvening

            return (
              <div className="px-4 pt-3 pb-2 border-b border-white/20">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
                  <div className="p-3 bg-gradient-to-r from-blue-50/30 via-white/50 to-green-50/30">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm mx-auto mb-1">
                          <Sun size={10} className="text-white stroke-2" />
                        </div>
                        <div className="text-base font-bold text-gray-900">{totalMorning.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">เช้า (กก.)</div>
                      </div>
                      <div className="text-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm mx-auto mb-1">
                          <Moon size={10} className="text-white stroke-2" />
                        </div>
                        <div className="text-base font-bold text-gray-900">{totalEvening.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">เย็น (กก.)</div>
                      </div>
                      <div className="text-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm mx-auto mb-1">
                          <TrendingUp size={10} className="text-white stroke-2" />
                        </div>
                        <div className="text-base font-bold text-gray-900">{grandTotal.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">รวม (กก.)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Action Buttons */}
          <div className="px-4 pt-2 pb-4">
            <div className="flex space-x-3">
            <Button
              onClick={handleCancel}
              variant="secondary"
              size="lg"
              disabled={loadingBackdateCheck || submittingBackdate}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 border-0 text-white font-bold h-12 rounded-xl shadow-lg"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleBackdateSubmit}
              variant="primary"
              size="lg"
              disabled={(() => {
                if (loadingBackdateCheck || submittingBackdate || !backdateData.date) return true

                // Check if there's any valid data to save
                const hasValidData = backdateData.records.some(record => {
                  const hasNewMorning = !record.hasMorning && record.morning && parseFloat(record.morning) > 0
                  const hasNewEvening = !record.hasEvening && record.evening && parseFloat(record.evening) > 0
                  return hasNewMorning || hasNewEvening
                })

                return !hasValidData
              })()}
              loading={submittingBackdate}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 font-bold h-12 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
            >
              บันทึก
            </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-60">
          <div className="fixed inset-0 bg-black bg-opacity-30"></div>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded shadow-sm max-w-sm w-full p-4">
              <h3 className="text-lg font-light text-gray-800 mb-3">ยืนยันการบันทึกข้อมูล</h3>
              <p className="text-lg font-light text-gray-600 mb-4">
                คุณต้องการบันทึกข้อมูลการรีดนมย้อนหลังวันที่ {backdateData.date} หรือไม่?
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowConfirmation(false)}
                  variant="ghost"
                  size="sm"
                  disabled={submittingBackdate}
                  className="flex-1 border border-gray-200 text-gray-600 font-light hover:bg-gray-50"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleConfirmBackdate}
                  variant="primary"
                  size="sm"
                  disabled={submittingBackdate}
                  loading={submittingBackdate}
                  className="flex-1 bg-black hover:bg-gray-800 border-0 font-light"
                >
                  ยืนยัน
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmation && (
        <div className="fixed inset-0 z-[99999]">
          <div className="fixed inset-0 bg-black bg-opacity-50"></div>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-white/20">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 9v3m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ยืนยันการยกเลิก</h3>
                <p className="text-sm text-gray-600 mb-6">
                  คุณมีข้อมูลที่ยังไม่ได้บันทึก หากยกเลิกข้อมูลจะหายไป คุณต้องการยกเลิกจริงหรือไม่?
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowCancelConfirmation(false)}
                    variant="secondary"
                    size="sm"
                    className="flex-1 border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                  >
                    กลับไป
                  </Button>
                  <Button
                    onClick={confirmCancel}
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 font-medium text-white"
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}