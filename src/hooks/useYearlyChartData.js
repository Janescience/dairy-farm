import { useState, useEffect } from 'react'

export function useYearlyChartData() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchYearlyData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/milk-records/yearly-chart?years=5')
      const result = await response.json()

      if (result.success) {
        setChartData(result.data)
      } else {
        setError(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error fetching yearly chart data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchYearlyData()
  }, [])

  return {
    chartData,
    loading,
    error,
    refetch: fetchYearlyData
  }
}