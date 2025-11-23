// Script to check data consistency between environments
// Run this to verify data is the same on local and Vercel

const checkDataConsistency = async () => {
  try {
    console.log('🔍 Checking Data Consistency...\n')

    // 1. Check Farms
    console.log('1. Checking Farms:')
    const farmsResponse = await fetch('/api/farms')
    const farmsData = await farmsResponse.json()

    if (farmsData.success) {
      console.log(`   ✅ Found ${farmsData.data.length} farms`)
      farmsData.data.forEach(farm => {
        console.log(`   📍 Farm: ${farm.name} (ID: ${farm._id})`)
      })
    } else {
      console.log('   ❌ Error fetching farms:', farmsData.error)
    }

    if (farmsData.data.length === 0) {
      console.log('\n⚠️  No farms found! Please create a farm in /admin first.\n')
      return
    }

    const farmId = farmsData.data[0]._id

    // 2. Check Cows
    console.log('\n2. Checking Cows:')
    const cowsResponse = await fetch('/api/cows')
    const cowsData = await cowsResponse.json()

    if (cowsData.success) {
      console.log(`   ✅ Found ${cowsData.data.length} cows`)
      cowsData.data.forEach(cow => {
        console.log(`   🐄 Cow: ${cow.name} (ID: ${cow._id})`)
      })
    } else {
      console.log('   ❌ Error fetching cows:', cowsData.error)
    }

    // 3. Check Users
    console.log('\n3. Checking Users:')
    // Note: We can't directly check users via API for security,
    // but we can verify they exist by checking if login works

    // 4. Check Sessions
    console.log('\n4. Checking Sessions:')
    const today = new Date().toISOString().split('T')[0]
    const sessionsResponse = await fetch(`/api/sessions?date=${today}`)
    const sessionsData = await sessionsResponse.json()

    if (sessionsData.success) {
      console.log(`   ✅ Sessions for today (${today}):`)
      console.log(`   🌅 Morning: Complete=${sessionsData.data.morning.isCompleted}, Total=${sessionsData.data.morning.totalMilk}kg`)
      console.log(`   🌆 Evening: Complete=${sessionsData.data.evening.isCompleted}, Total=${sessionsData.data.evening.totalMilk}kg`)
    } else {
      console.log('   ❌ Error fetching sessions:', sessionsData.error)
    }

    // 5. Check Milk Records
    console.log('\n5. Checking Milk Records:')
    const recordsResponse = await fetch(`/api/milk-records?date=${today}`)
    const recordsData = await recordsResponse.json()

    if (recordsData.success) {
      console.log(`   ✅ Found ${recordsData.data.length} milk records for today`)
    } else {
      console.log('   ❌ Error fetching milk records:', recordsData.error)
    }

    console.log('\n✨ Data consistency check completed!')
    console.log('\n💡 To ensure consistency between local and Vercel:')
    console.log('   1. Both should have the same farms (created via /admin)')
    console.log('   2. Both should have the same users (auto-created with farms)')
    console.log('   3. farmId should be consistent for all related data')
    console.log('   4. Use the same MongoDB connection string for both environments')

  } catch (error) {
    console.error('❌ Error checking data consistency:', error)
  }
}

// For browser console usage
if (typeof window !== 'undefined') {
  window.checkDataConsistency = checkDataConsistency
  console.log('💡 Run checkDataConsistency() in browser console to check data')
}

export default checkDataConsistency