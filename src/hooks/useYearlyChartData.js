import { useState, useEffect } from 'react'

export function useYearlyChartData(farmId) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchYearlyData = async () => {
    if (!farmId) return

    setLoading(true)
    setError(null)

    try {
      const currentYear = new Date().getFullYear()
      const years = []

      // Generate last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i
        years.push({
          year: year,
          displayYear: year.toString()
        })
      }

      // Fetch data for each year
      const promises = years.map(year =>
        fetch(`/api/milk-records/yearly?farmId=${farmId}&year=${year.year}`)
          .then(res => res.json())
          .catch(() => ({ success: false, data: { total: 0 } }))
      )

      const results = await Promise.all(promises)

      const chartData = years.map((year, index) => {
        const result = results[index]
        const total = result.success ? (result.data?.total || 0) : 0

        return {
          year: year.year,
          total: total,
          displayYear: year.displayYear
        }
      })

      setChartData(chartData)
    } catch (err) {
      setError('Network error')
      console.error('Error fetching yearly chart data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (farmId) {
      fetchYearlyData()
    }
  }, [farmId])

  return {
    chartData,
    loading,
    error,
    refetch: fetchYearlyData
  }
}