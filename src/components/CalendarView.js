import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Milk, Loader2 } from 'lucide-react'
import Button from './Button'

export default function CalendarView({ onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthlyData, setMonthlyData] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [error, setError] = useState(null)

  // Helper functions
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  const thaiDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

  const formatDateKey = (date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Fetch monthly summary data
  const fetchMonthlyData = async (year, month) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/milk-records/monthly-summary?year=${year}&month=${month + 1}`)
      const result = await response.json()

      if (result.success) {
        setMonthlyData(prev => ({
          ...prev,
          [`${year}-${month}`]: result.data
        }))
      } else {
        setError(result.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล')
        // Set empty data if API fails
        setMonthlyData(prev => ({
          ...prev,
          [`${year}-${month}`]: {}
        }))
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error)
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้')
      // Set empty data if fetch fails
      setMonthlyData(prev => ({
        ...prev,
        [`${year}-${month}`]: {}
      }))
    } finally {
      setLoading(false)
    }
  }

  // Load data when month changes (only if not already cached)
  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const key = `${year}-${month}`

    // Only fetch if we don't have data for this month yet
    if (!monthlyData[key] && !loading) {
      fetchMonthlyData(year, month)
    }
  }, [currentDate])

  // Get calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)

    // Start from Sunday of the week containing the first day
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

    const currentCalendarDate = new Date(startDate)

    while (currentCalendarDate <= endDate) {
      days.push(new Date(currentCalendarDate))
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1)
    }

    return days
  }

  // Handle date selection
  const handleDateSelect = (date) => {
    const dateKey = formatDateKey(date)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthKey = `${year}-${month}`
    const currentMonthData = monthlyData[monthKey] || {}
    const dayData = currentMonthData[dateKey]
    const hasData = dayData && dayData.total > 0

    setSelectedDate(date)

    if (onDateSelect) {
      // Pass both dateKey and hasData to parent
      onDateSelect(dateKey, hasData)
    }
  }

  // Navigate months
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const calendarDays = getCalendarDays()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthKey = `${year}-${month}`
  const currentMonthData = monthlyData[monthKey] || {}

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-0 shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50/30 via-white/50 to-green-50/30 p-4 border-b border-gray-100/50">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigateMonth(-1)}
            variant="ghost"
            size="sm"
            icon={<ChevronLeft size={18} className="stroke-1" />}
            className="text-gray-400 hover:text-gray-600 p-2"
          />

          <div className="flex items-center space-x-2">
            <Calendar size={18} className="text-blue-500" />
            <h2 className="text-lg font-light text-gray-900">
              {thaiMonths[month]} {year + 543}
            </h2>
          </div>

          <Button
            onClick={() => navigateMonth(1)}
            variant="ghost"
            size="sm"
            icon={<ChevronRight size={18} className="stroke-1" />}
            className="text-gray-400 hover:text-gray-600 p-2"
            disabled={new Date(year, month + 1, 1) > new Date()}
          />
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-3 mb-4">
          {thaiDays.map((day) => (
            <div key={day} className="text-center py-2 text-base font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-sm font-medium mb-4">
            {error}
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="relative">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
              <div className="flex items-center space-x-2">
                <Loader2 size={20} className="animate-spin text-blue-500" />
                <span className="text-sm font-medium text-gray-600">กำลังโหลดข้อมูล...</span>
              </div>
            </div>
          </div>
        )}

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-3 relative">
          {calendarDays.map((date) => {
            const dateKey = formatDateKey(date)
            const dayData = currentMonthData[dateKey]
            const isCurrentMonth = date.getMonth() === month
            const isToday = formatDateKey(date) === formatDateKey(new Date())
            const isSelected = formatDateKey(date) === formatDateKey(selectedDate)
            const isFuture = date > new Date()
            const hasData = dayData && dayData.total > 0

            return (
              <button
                key={dateKey}
                onClick={() => !isFuture && handleDateSelect(date)}
                disabled={isFuture}
                className={`
                  w-full h-16 p-3 rounded-xl text-sm font-light transition-all duration-200 relative
                  ${!isCurrentMonth
                    ? 'text-gray-300 cursor-not-allowed'
                    : isFuture
                      ? 'text-gray-300 cursor-not-allowed'
                      : hasData
                        ? 'text-gray-700 hover:bg-blue-50 cursor-pointer'
                        : 'text-gray-500 cursor-default'
                  }
                  ${isToday && isCurrentMonth ? 'bg-blue-500 text-white font-medium' : ''}
                  ${isSelected && !isToday ? 'bg-blue-100 text-blue-700 font-medium' : ''}
                  ${hasData && isCurrentMonth && !isToday && !isSelected ? 'bg-green-50 border border-green-200 hover:bg-green-100' : ''}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <span className={`${hasData ? 'text-lg' : 'text-base'} ${isToday ? 'font-bold' : hasData ? 'font-semibold' : 'font-medium'}`}>
                    {date.getDate()}
                  </span>

                  {/* Milk amount indicator */}
                  {hasData && isCurrentMonth && (
                    <div className="flex flex-col items-center">
                      <span className={`text-base font-bold ${isToday ? 'text-white' : 'text-green-700'} leading-none`}>
                        {dayData.total.toFixed(0)}
                      </span>
                      <span className={`text-xs ${isToday ? 'text-white/80' : 'text-green-600'} leading-none`}>
                        กก.
                      </span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Summary for selected date */}
        {selectedDate && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50/50 to-green-50/50 rounded-2xl">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 mb-1">
                วันที่ {selectedDate.getDate()} {thaiMonths[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}
              </div>
              {currentMonthData[formatDateKey(selectedDate)] && currentMonthData[formatDateKey(selectedDate)].total > 0 ? (
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Milk size={16} className="text-blue-500" />
                    <span className="text-lg font-semibold text-gray-900">
                      {currentMonthData[formatDateKey(selectedDate)].total.toFixed(2)} กก.
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentMonthData[formatDateKey(selectedDate)].count} บันทึก
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  ไม่มีข้อมูลการรีดนมในวันนี้
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}