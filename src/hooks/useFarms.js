import { useState, useEffect } from 'react'

export function useFarms() {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch farms
  const fetchFarms = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/farms')
      const result = await response.json()

      if (result.success) {
        setFarms(result.data)
      } else {
        setError(result.error || 'Failed to fetch farms')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error fetching farms:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create farm
  const createFarm = async (farmData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmData)
      })

      const result = await response.json()

      if (result.success) {
        setFarms(prev => [result.data, ...prev])
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to create farm')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = 'Network error'
      setError(errorMsg)
      console.error('Error creating farm:', err)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFarms()
  }, [])

  return {
    farms,
    loading,
    error,
    createFarm,
    refetch: fetchFarms
  }
}