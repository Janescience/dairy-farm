import { useState, useEffect } from 'react'
import { getTodayThailand } from '../lib/datetime'

export function useChartData(days = 10) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchChartData = async () => {

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/milk-records/chart-data?days=${days}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const result = await response.json()

      if (result.success) {
        setChartData(result.data)
      } else {
        setError(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error fetching chart data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChartData()
  }, [days])

  return {
    chartData,
    loading,
    error,
    refetch: fetchChartData
  }
}