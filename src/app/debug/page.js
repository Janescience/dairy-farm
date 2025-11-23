'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function DebugPage() {
  const { user } = useAuth()
  const [results, setResults] = useState('')
  const [loading, setLoading] = useState(false)

  const checkDataConsistency = async () => {
    setLoading(true)
    setResults('🔍 Checking Data Consistency...\n\n')

    try {
      // 1. Check current user
      setResults(prev => prev + '1. Current User:\n')
      if (user) {
        setResults(prev => prev + `   ✅ Logged in as: ${user.username}\n`)
        setResults(prev => prev + `   🏢 Farm: ${user.farmName} (ID: ${user.farmId})\n`)
        setResults(prev => prev + `   👤 Role: ${user.role}\n\n`)
      } else {
        setResults(prev => prev + '   ❌ No user logged in\n\n')
        setLoading(false)
        return
      }

      // 2. Check Farms
      setResults(prev => prev + '2. Checking Farms:\n')
      const farmsResponse = await fetch('/api/farms')
      const farmsData = await farmsResponse.json()

      if (farmsData.success) {
        setResults(prev => prev + `   ✅ Found ${farmsData.data.length} farms\n`)
        farmsData.data.forEach(farm => {
          setResults(prev => prev + `   📍 Farm: ${farm.name} (ID: ${farm._id})\n`)
        })
      } else {
        setResults(prev => prev + `   ❌ Error fetching farms: ${farmsData.error}\n`)
      }

      const farmId = user.farmId

      // 3. Check Cows
      setResults(prev => prev + '\n3. Checking Cows:\n')
      const cowsResponse = await fetch('/api/cows')
      const cowsData = await cowsResponse.json()

      if (cowsData.success) {
        setResults(prev => prev + `   ✅ Found ${cowsData.data.length} cows\n`)
        cowsData.data.forEach(cow => {
          setResults(prev => prev + `   🐄 Cow: ${cow.name} (ID: ${cow._id})\n`)
        })
      } else {
        setResults(prev => prev + `   ❌ Error fetching cows: ${cowsData.error}\n`)
      }

      // 4. Check Sessions
      setResults(prev => prev + '\n4. Checking Sessions:\n')
      const today = new Date().toISOString().split('T')[0]
      const sessionsResponse = await fetch(`/api/sessions?date=${today}`)
      const sessionsData = await sessionsResponse.json()

      if (sessionsData.success) {
        setResults(prev => prev + `   ✅ Sessions for today (${today}):\n`)
        setResults(prev => prev + `   🌅 Morning: Complete=${sessionsData.data.morning.isCompleted}, Total=${sessionsData.data.morning.totalMilk}kg\n`)
        setResults(prev => prev + `   🌆 Evening: Complete=${sessionsData.data.evening.isCompleted}, Total=${sessionsData.data.evening.totalMilk}kg\n`)
      } else {
        setResults(prev => prev + `   ❌ Error fetching sessions: ${sessionsData.error}\n`)
      }

      // 5. Check Milk Records
      setResults(prev => prev + '\n5. Checking Milk Records:\n')
      const recordsResponse = await fetch(`/api/milk-records?date=${today}`)
      const recordsData = await recordsResponse.json()

      if (recordsData.success) {
        setResults(prev => prev + `   ✅ Found ${recordsData.data.length} milk records for today\n`)
      } else {
        setResults(prev => prev + `   ❌ Error fetching milk records: ${recordsData.error}\n`)
      }

      setResults(prev => prev + '\n✨ Data consistency check completed!\n\n')
      setResults(prev => prev + '💡 To ensure consistency between local and Vercel:\n')
      setResults(prev => prev + '   1. Both should have the same farms (created via /admin)\n')
      setResults(prev => prev + '   2. Both should have the same users (auto-created with farms)\n')
      setResults(prev => prev + '   3. farmId should be consistent for all related data\n')
      setResults(prev => prev + '   4. Use the same MongoDB connection string for both environments\n')

    } catch (error) {
      setResults(prev => prev + `❌ Error checking data consistency: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🐛 Debug - Data Consistency Check
          </h1>

          <div className="mb-6">
            <button
              onClick={checkDataConsistency}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-md font-medium"
            >
              {loading ? '🔄 Checking...' : '🔍 Check Data Consistency'}
            </button>
          </div>

          {results && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
              {results}
            </div>
          )}

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-yellow-800 font-medium mb-2">📝 Instructions:</h3>
            <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
              <li>Run this check on both local and Vercel environments</li>
              <li>Compare the results to ensure data consistency</li>
              <li>If farms are missing, create them via <code>/admin</code></li>
              <li>If data differs, check MongoDB connection strings</li>
              <li>Make sure both environments use the same database</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}