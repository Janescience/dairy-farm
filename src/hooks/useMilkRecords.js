import { useState, useEffect } from 'react'
import { getTodayThailand } from '../lib/datetime'

export function useMilkRecords(selectedDate = null) {
  const [records, setRecords] = useState([])
  const [sessions, setSessions] = useState({ morning: null, evening: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const date = selectedDate || getTodayThailand()

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/sessions?date=${date}`)
      const result = await response.json()

      if (result.success) {
        setSessions(result.data)
      }
    } catch (err) {
      console.error('Error fetching sessions:', err)
    }
  }

  // Fetch milk records
  const fetchRecords = async (session = null) => {
    setLoading(true)
    setError(null)

    try {
      const url = session
        ? `/api/milk-records?date=${date}&session=${session}`
        : `/api/milk-records?date=${date}`

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setRecords(result.data)
      } else {
        setError(result.error || 'Failed to fetch records')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error fetching milk records:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create milk record
  const createRecord = async (recordData, isBackdate = false) => {
    setError(null)

    try {
      const response = await fetch('/api/milk-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...recordData,
          date: recordData.date || date
        })
      })

      const result = await response.json()

      if (result.success) {
        // For backdate records, don't add to current state if date is different
        if (!isBackdate || recordData.date === date) {
          setRecords(prev => [...prev, result.data])
        }
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to create record')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = 'Network error'
      setError(errorMsg)
      console.error('Error creating milk record:', err)
      return { success: false, error: errorMsg }
    } finally {
      // Don't set loading for optimistic updates
    }
  }

  // Update milk record
  const updateRecord = async (recordId, recordData) => {
    setError(null)

    try {
      const response = await fetch(`/api/milk-records/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData)
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setRecords(prev => prev.map(record =>
          record._id === recordId ? result.data : record
        ))
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to update record')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = 'Network error'
      setError(errorMsg)
      console.error('Error updating milk record:', err)
      return { success: false, error: errorMsg }
    } finally {
      // Don't set loading for optimistic updates
    }
  }

  // Delete milk record
  const deleteRecord = async (recordId) => {
    setError(null)

    try {
      const response = await fetch(`/api/milk-records/${recordId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        // Remove from local state
        setRecords(prev => prev.filter(record => record._id !== recordId))
        return { success: true }
      } else {
        setError(result.error || 'Failed to delete record')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = 'Network error'
      setError(errorMsg)
      console.error('Error deleting milk record:', err)
      return { success: false, error: errorMsg }
    } finally {
      // Don't set loading for optimistic updates
    }
  }

  // Get records by session
  const getRecordsBySession = (session) => {
    return records.filter(record => record.session === session)
  }

  useEffect(() => {
    fetchSessions()
    fetchRecords()
  }, [date])

  return {
    records,
    sessions,
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    getRecordsBySession,
    refetch: () => {
      fetchSessions()
      fetchRecords()
    }
  }
}