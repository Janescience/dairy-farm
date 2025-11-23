import { useState, useEffect } from 'react'

export function useCows() {
  const [cows, setCows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch cows
  const fetchCows = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cows')
      const result = await response.json()

      if (result.success) {
        setCows(result.data)
      } else {
        setError(result.error || 'Failed to fetch cows')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error fetching cows:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create cow
  const createCow = async (cowData) => {
    console.log('useCows createCow called:', { cowData })
    setLoading(true)
    setError(null)

    try {
      const payload = cowData
      console.log('API payload:', payload)

      const response = await fetch('/api/cows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      console.log('API response status:', response.status)
      const result = await response.json()
      console.log('API response data:', result)

      if (result.success) {
        setCows(prev => [result.data, ...prev])
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to create cow')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = 'Network error'
      setError(errorMsg)
      console.error('Error creating cow:', err)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Update cow
  const updateCow = async (cowId, cowData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cows/${cowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cowData)
      })

      const result = await response.json()

      if (result.success) {
        setCows(prev => prev.map(cow =>
          cow._id === cowId ? result.data : cow
        ))
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to update cow')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = 'Network error'
      setError(errorMsg)
      console.error('Error updating cow:', err)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Delete cow
  const deleteCow = async (cowId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cows/${cowId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setCows(prev => prev.filter(cow => cow._id !== cowId))
        return { success: true }
      } else {
        setError(result.error || 'Failed to delete cow')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = 'Network error'
      setError(errorMsg)
      console.error('Error deleting cow:', err)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCows()
  }, [])

  return {
    cows,
    loading,
    error,
    createCow,
    updateCow,
    deleteCow,
    refetch: fetchCows
  }
}