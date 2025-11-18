import { useState, useEffect } from 'react'
import { X, Calendar, Plus, Check } from 'lucide-react'
import Avatar from './Avatar'
import Button from './Button'

export default function BackdateModal({
  showBackdateModal,
  setShowBackdateModal,
  selectedFarmId,
  cows
}) {
  const [backdateData, setBackdateData] = useState({ date: '', records: [] })
  const [backdateExistingRecords, setBackdateExistingRecords] = useState([])
  const [loadingBackdateCheck, setLoadingBackdateCheck] = useState(false)
  const [errors, setErrors] = useState({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [submittingBackdate, setSubmittingBackdate] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

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
    if (showBackdateModal && !backdateData.date) {
      const yesterday = getYesterdayThailand()
      setBackdateData({ date: yesterday, records: [] })
      setBackdateExistingRecords([])
      setErrors({})
      setHasUnsavedChanges(false)
      // Auto-load data for yesterday
      handleBackdateDateChange(yesterday)
    }
  }, [showBackdateModal, backdateData.date])
  // Handle date change for backdate
  const handleBackdateDateChange = async (newDate) => {
    setLoadingBackdateCheck(true)
    setErrors({})

    try {
      // ดึงข้อมูลที่บันทึกไปแล้วในวันที่เลือก
      const response = await fetch(`/api/milk-records?farmId=${selectedFarmId}&date=${newDate}`)
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
            farmId: selectedFarmId,
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
    <div className="fixed inset-0 z-50">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 transition-opacity"
        onClick={() => !submittingBackdate && setShowBackdateModal(false)}
      ></div>

      {/* Modal panel - Full screen on mobile */}
      <div className="fixed inset-0 bg-white transform transition-all overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-light text-gray-800">บันทึกข้อมูลย้อนหลัง</h2>
            <Button
              onClick={() => !submittingBackdate && setShowBackdateModal(false)}
              variant="ghost"
              size="sm"
              icon={<X size={16} className="stroke-1" />}
              disabled={submittingBackdate}
              className="text-gray-400 hover:text-gray-600 p-1"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-32">
          {/* Error Message */}
          {errors.backdate && (
            <div className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-2 rounded mb-4 text-lg font-light">
              {errors.backdate}
            </div>
          )}

          {/* Complete Message */}
          {!loadingBackdateCheck && backdateData.records.length === 0 && backdateData.date && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={24} className="text-gray-400 stroke-1" />
              </div>
              <h3 className="text-lg font-light text-gray-700 mb-0.5">บันทึกครบหมดแล้ว</h3>
              <p className="text-lg font-light text-gray-400">โคทุกตัวได้บันทึกข้อมูลครบทั้ง 2 รอบในวันนี้แล้ว</p>
            </div>
          )}

          {/* Cow Records */}
          {!loadingBackdateCheck && backdateData.records.length > 0 && (
            <div className="space-y-4">
              <div>
                {/* Summary */}
                {backdateData.records.length > 0 && (
                  (() => {
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
                      <div className="bg-gray-25 border border-gray-100 p-2.5 rounded mb-3">
                        <div className="grid grid-cols-3 gap-2.5 text-lg text-gray-600">
                          <div className="text-center">
                            <div className="font-light">{totalMorning.toFixed(1)} กก.</div>
                            <div className=" font-light text-gray-400">เช้า</div>
                          </div>
                          <div className="text-center">
                            <div className="font-light">{totalEvening.toFixed(1)} กก.</div>
                            <div className=" font-light text-gray-400">เย็น</div>
                          </div>
                          <div className="text-center border-l border-gray-200">
                            <div className="font-normal text-black">{grandTotal.toFixed(1)} กก.</div>
                            <div className=" font-light text-gray-400">รวม</div>
                          </div>
                        </div>
                      </div>
                    )
                  })()
                )}

                {/* Header */}
                <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gray-25 border border-gray-100 rounded text-lg text-gray-500 font-light">
                  <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                    <span className="flex-shrink-0 text-lg">#</span>
                    <span className="truncate">ชื่อโค</span>
                  </div>
                  <div className="w-16 text-center text-lg">เช้า (กก.)</div>
                  <div className="w-16 text-center text-lg">เย็น (กก.)</div>
                  <div className="w-5"></div>
                </div>
              </div>

              <div className="space-y-2">
                {backdateData.records.map((record, index) => (
                  <div key={record.cowId} className="bg-white border border-gray-100 rounded p-2.5">
                    <div className="flex items-center space-x-1.5">
                      {/* Number, Avatar and Name */}
                      <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                        <span className="text-lg text-gray-400 font-light flex-shrink-0">#{index + 1}</span>
                        <Avatar
                          username={record.cowName}
                          size={24}
                          className="rounded-full flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-lg font-light text-gray-700 truncate block">{record.cowName}</span>
                          {(record.hasMorning || record.hasEvening) && (
                            <div className="text-lg text-gray-400 font-light">
                              {record.hasMorning && 'บันทึกเช้าแล้ว'}
                              {record.hasMorning && record.hasEvening && ' • '}
                              {record.hasEvening && 'บันทึกเย็นแล้ว'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Morning Input */}
                      <div className="w-16">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="0.0"
                          value={record.morning}
                          onChange={(e) => handleBackdateRecordChange(record.cowId, 'morning', e.target.value)}
                          disabled={record.hasMorning}
                          className={`w-full border rounded px-1.5 py-1 text-lg font-light text-center focus:ring-1 focus:ring-gray-300 focus:border-gray-400 ${
                            record.hasMorning
                              ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-200'
                          }`}
                        />
                      </div>

                      {/* Evening Input */}
                      <div className="w-16">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="0.0"
                          value={record.evening}
                          onChange={(e) => handleBackdateRecordChange(record.cowId, 'evening', e.target.value)}
                          disabled={record.hasEvening}
                          className={`w-full border rounded px-1.5 py-1 text-lg font-light text-center focus:ring-1 focus:ring-gray-300 focus:border-gray-400 ${
                            record.hasEvening
                              ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-200'
                          }`}
                        />
                      </div>

                      {/* Delete Button */}
                      <Button
                        onClick={() => handleRemoveCowFromBackdate(record.cowId)}
                        variant="ghost"
                        size="sm"
                        icon={<X size={12} className="stroke-1" />}
                        className="text-red-400 hover:text-red-600 p-0.5 w-5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Controls */}
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4">
          {/* Date Picker */}
          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-1.5">
              <Calendar size={14} className="text-gray-400 stroke-1" />
              <label className="text-lg font-light text-gray-500">วันที่ที่ต้องการบันทึก</label>
            </div>
            <input
              type="date"
              value={backdateData.date}
              max={getYesterdayThailand()}
              onChange={(e) => handleBackdateDateChange(e.target.value)}
              disabled={loadingBackdateCheck || submittingBackdate}
              className="w-full border border-gray-200 rounded px-3 py-2 text-lg font-light focus:ring-1 focus:ring-gray-300 focus:border-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowBackdateModal(false)}
              variant="danger"
              size="md"
              disabled={loadingBackdateCheck || submittingBackdate}
              className="flex-1 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-light"
              icon={<X size={14} className="stroke-1" />}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleBackdateSubmit}
              variant="primary"
              size="md"
              disabled={loadingBackdateCheck || submittingBackdate || !backdateData.date}
              loading={submittingBackdate}
              className="flex-1 bg-black hover:bg-gray-800 border-0 font-light"
              icon={<Check size={14} className="stroke-1" />}
            >
              บันทึกข้อมูล
            </Button>
            <Button
              onClick={handleAddCowToBackdate}
              variant="secondary"
              size="md"
              disabled={loadingBackdateCheck || submittingBackdate}
              className="flex-1 border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 font-light"
              icon={<Plus size={14} className="stroke-1" />}
            >
              เพิ่มโค
            </Button>
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
    </div>
  )
}