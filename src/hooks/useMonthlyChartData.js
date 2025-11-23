import { useState, useEffect } from 'react'

export function useMonthlyChartData() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMonthlyData = async () => {

    setLoading(true)
    setError(null)

    try {
      const currentYear = new Date().getFullYear()
      const response = await fetch(`/api/milk-records/monthly-chart?year=${currentYear}`)
      const result = await response.json()

      if (result.success) {
        setChartData(result.data)
      } else {
        setError(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error fetching monthly chart data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonthlyData()
  }, [])

  return {
    chartData,
    loading,
    error,
    refetch: fetchMonthlyData
  }
}