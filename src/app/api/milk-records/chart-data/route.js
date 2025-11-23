import dbConnect from '../../../../lib/mongodb'
import MilkRecord from '../../../../models/MilkRecord'
import { getTodayThailand } from '../../../../lib/datetime'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

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
    const days = parseInt(searchParams.get('days')) || 10

    // Generate array of last N dates
    const dates = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toLocaleDateString('sv-SE', {
        timeZone: 'Asia/Bangkok'
      }))
    }

    // Aggregate milk records for all dates in single query
    const allRecords = await MilkRecord.aggregate([
      {
        $match: {
          farmId: new mongoose.Types.ObjectId(farmId), // Convert string to ObjectId
          date: {
            $gte: dates[0],
            $lte: dates[dates.length - 1]
          }
        }
      },
      {
        $group: {
          _id: '$date',
          total: { $sum: '$milkAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    // Create lookup map for faster access
    const recordsMap = allRecords.reduce((map, record) => {
      map[record._id] = record.total
      return map
    }, {})


    // Build chart data with all dates (including zeros)
    const chartData = dates.map(date => {
      const total = recordsMap[date] || 0

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


    return Response.json({
      success: true,
      data: chartData
    })

  } catch (error) {
    console.error('Error in chart-data API:', error)
    console.error('farmId:', farmId, 'dates range:', dates[0], '-', dates[dates.length - 1])
    return Response.json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลกราฟ'
    }, { status: 500 })
  }
}