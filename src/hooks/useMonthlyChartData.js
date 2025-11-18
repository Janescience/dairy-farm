import { useState, useEffect } from 'react'

export function useMonthlyChartData(farmId) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMonthlyData = async () => {
    if (!farmId) return

    setLoading(true)
    setError(null)

    try {
      const currentYear = new Date().getFullYear()
      const months = []

      // Generate all 12 months of current year
      for (let month = 0; month < 12; month++) {
        const date = new Date(currentYear, month, 1)
        months.push({
          year: currentYear,
          month: month + 1,
          startDate: new Date(currentYear, month, 1).toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' }),
          endDate: new Date(currentYear, month + 1, 0).toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' }),
          displayMonth: date.toLocaleDateString('th-TH', {
            month: 'short',
            timeZone: 'Asia/Bangkok'
          })
        })
      }

      // Fetch data for each month
      const promises = months.map(month =>
        fetch(`/api/milk-records/monthly?farmId=${farmId}&year=${month.year}&month=${month.month}`)
          .then(res => res.json())
          .catch(() => ({ success: false, data: { total: 0 } }))
      )

      const results = await Promise.all(promises)

      const chartData = months.map((month, index) => {
        const result = results[index]
        const total = result.success ? (result.data?.total || 0) : 0

        return {
          year: month.year,
          month: month.month,
          total: total,
          displayMonth: month.displayMonth
        }
      })

      setChartData(chartData)
    } catch (err) {
      setError('Network error')
      console.error('Error fetching monthly chart data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (farmId) {
      fetchMonthlyData()
    }
  }, [farmId])

  return {
    chartData,
    loading,
    error,
    refetch: fetchMonthlyData
  }
}