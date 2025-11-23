import { useState, useEffect } from 'react'
import { getTodayThailand, getYesterdayThailand } from '../lib/datetime'

export function useDailySummary(selectedDate = null) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const date = selectedDate || getTodayThailand()

  const fetchDailySummary = async () => {
    setLoading(true)
    setError(null)

    try {
      const yesterday = getYesterdayThailand()

      // Fetch both today's and yesterday's data
      const [sessionsRes, recordsRes, yesterdayRecordsRes] = await Promise.all([
        fetch(`/api/sessions?date=${date}`),
        fetch(`/api/milk-records?date=${date}`),
        fetch(`/api/milk-records?date=${yesterday}`)
      ])

      const [sessionsResult, recordsResult, yesterdayRecordsResult] = await Promise.all([
        sessionsRes.json(),
        recordsRes.json(),
        yesterdayRecordsRes.json()
      ])

      if (sessionsResult.success && recordsResult.success) {
        const sessions = sessionsResult.data
        const records = recordsResult.data
        const yesterdayRecords = yesterdayRecordsResult.success ? yesterdayRecordsResult.data : []

        // Group records by session
        const morningRecords = records.filter(r => r.session === 'morning')
        const eveningRecords = records.filter(r => r.session === 'evening')

        // Calculate totals
        const morningTotal = morningRecords.reduce((sum, r) => sum + r.milkAmount, 0)
        const eveningTotal = eveningRecords.reduce((sum, r) => sum + r.milkAmount, 0)
        const dayTotal = morningTotal + eveningTotal

        // Calculate yesterday's totals for comparison
        const yesterdayMorningTotal = yesterdayRecords.filter(r => r.session === 'morning').reduce((sum, r) => sum + r.milkAmount, 0)
        const yesterdayEveningTotal = yesterdayRecords.filter(r => r.session === 'evening').reduce((sum, r) => sum + r.milkAmount, 0)
        const yesterdayTotal = yesterdayMorningTotal + yesterdayEveningTotal

        // Find top producers with yesterday comparison
        const cowTotals = {}
        const yesterdayCowTotals = {}

        // Today's data
        records.forEach(record => {
          const cowId = record.cowId._id
          const cowName = record.cowId.name
          if (!cowTotals[cowId]) {
            cowTotals[cowId] = {
              name: cowName,
              morning: 0,
              evening: 0,
              total: 0
            }
          }
          cowTotals[cowId][record.session] += record.milkAmount
          cowTotals[cowId].total += record.milkAmount
        })

        // Yesterday's data for comparison
        yesterdayRecords.forEach(record => {
          const cowId = record.cowId._id
          const cowName = record.cowId.name
          if (!yesterdayCowTotals[cowId]) {
            yesterdayCowTotals[cowId] = {
              name: cowName,
              morning: 0,
              evening: 0,
              total: 0
            }
          }
          yesterdayCowTotals[cowId][record.session] += record.milkAmount
          yesterdayCowTotals[cowId].total += record.milkAmount
        })

        // Add comparison data to cow totals
        Object.keys(cowTotals).forEach(cowId => {
          const yesterday = yesterdayCowTotals[cowId] || { morning: 0, evening: 0, total: 0 }
          cowTotals[cowId].yesterdayTotal = yesterday.total
          cowTotals[cowId].yesterdayMorning = yesterday.morning
          cowTotals[cowId].yesterdayEvening = yesterday.evening
          cowTotals[cowId].diffTotal = cowTotals[cowId].total - yesterday.total
          cowTotals[cowId].diffMorning = cowTotals[cowId].morning - yesterday.morning
          cowTotals[cowId].diffEvening = cowTotals[cowId].evening - yesterday.evening
        })

        const topProducers = Object.values(cowTotals)
          .sort((a, b) => b.total - a.total)

        setSummary({
          date,
          sessions: {
            morning: {
              total: morningTotal,
              count: morningRecords.length,
              records: morningRecords,
              yesterdayTotal: yesterdayMorningTotal,
              diff: morningTotal - yesterdayMorningTotal
            },
            evening: {
              total: eveningTotal,
              count: eveningRecords.length,
              records: eveningRecords,
              yesterdayTotal: yesterdayEveningTotal,
              diff: eveningTotal - yesterdayEveningTotal
            }
          },
          dayTotal,
          totalRecords: records.length,
          topProducers,
          yesterdayTotal,
          dayDiff: dayTotal - yesterdayTotal
        })
      } else {
        setError('Failed to fetch summary data')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error fetching daily summary:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDailySummary()
  }, [date])

  return {
    summary,
    loading,
    error,
    refetch: fetchDailySummary
  }
}