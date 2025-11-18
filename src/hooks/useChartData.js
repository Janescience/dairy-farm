import { useState, useEffect } from 'react'
import { getTodayThailand } from '../lib/datetime'

export function useChartData(farmId, days = 10) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchChartData = async () => {
    if (!farmId) return

    setLoading(true)
    setError(null)

    try {
      // Generate array of last 10 dates
      const dates = []
      const today = new Date()
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        dates.push(date.toLocaleDateString('sv-SE', {
          timeZone: 'Asia/Bangkok'
        }))
      }

      // Fetch data for all dates
      const promises = dates.map(date =>
        fetch(`/api/milk-records?farmId=${farmId}&date=${date}`)
          .then(res => res.json())
      )

      const results = await Promise.all(promises)

      const chartData = dates.map((date, index) => {
        const result = results[index]
        const records = result.success ? result.data : []
        const total = records.reduce((sum, record) => sum + record.milkAmount, 0)

        return {
          date,
          total: total,
          displayDate: new Date(date).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'numeric',
            timeZone: 'Asia/Bangkok'
          })
        }
      })

      setChartData(chartData)
    } catch (err) {
      setError('Network error')
      console.error('Error fetching chart data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (farmId) {
      fetchChartData()
    }
  }, [farmId, days])

  return {
    chartData,
    loading,
    error,
    refetch: fetchChartData
  }
}