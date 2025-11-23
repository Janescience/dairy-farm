import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function useFarms() {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Fetch farms
  const fetchFarms = async () => {
    if (user?.farmId) {
      // Use farm data from auth context only
      const userFarm = {
        _id: user.farmId,
        name: user.farmName
      }
      setFarms([userFarm])
      setLoading(false)
      return
    }

    // If no user session, set empty farms
    setFarms([])
    setLoading(false)
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
  }, [user])

  return {
    farms,
    loading,
    error,
    createFarm,
    refetch: fetchFarms
  }
}