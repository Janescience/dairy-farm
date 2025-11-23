import dbConnect from '../../../../lib/mongodb'
import MilkRecord from '../../../../models/MilkRecord'
import mongoose from 'mongoose'

export async function GET(request) {
  try {
    await dbConnect()

    // Get farmId from session cookie instead of query params
    const session = request.cookies.get('session')
    if (!session) {
      return Response.json({ success: false, error: 'No active session' }, { status: 401 })
    }

    const sessionData = JSON.parse(session.value)
    const farmId = sessionData.farmId

    if (!farmId) {
      return Response.json({ success: false, error: 'ไม่พบ farmId ใน session' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year'))
    const month = parseInt(searchParams.get('month'))

    if (!year || !month) {
      return Response.json({
        success: false,
        error: 'Missing required parameters: year, month'
      }, { status: 400 })
    }

    // Calculate date range for the month
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`

    // Aggregate daily totals for the entire month
    const dailyTotals = await MilkRecord.aggregate([
      {
        $match: {
          farmId: new mongoose.Types.ObjectId(farmId),
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: '$date',
          total: { $sum: '$milkAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    // Create a map for easy access
    const dailyData = {}
    dailyTotals.forEach(day => {
      dailyData[day._id] = {
        total: day.total,
        count: day.count
      }
    })

    // Generate all days of the month (including days with no data)
    const monthData = {}
    for (let day = 1; day <= lastDay; day++) {
      const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      monthData[dateKey] = dailyData[dateKey] || { total: 0, count: 0 }
    }

    return Response.json({
      success: true,
      data: monthData
    })

  } catch (error) {
    console.error('Error in monthly-summary API:', error)
    return Response.json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสรุปรายเดือน'
    }, { status: 500 })
  }
}