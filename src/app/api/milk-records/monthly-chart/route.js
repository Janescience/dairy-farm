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
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear()

    // Aggregate milk records for all months in the year
    const records = await MilkRecord.aggregate([
      {
        $match: {
          farmId: new mongoose.Types.ObjectId(farmId),
          date: {
            $gte: `${year}-01-01`,
            $lte: `${year}-12-31`
          }
        }
      },
      {
        $addFields: {
          month: { $month: { $dateFromString: { dateString: '$date' } } }
        }
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: '$milkAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    // Create lookup map for faster access
    const recordsMap = records.reduce((map, record) => {
      map[record._id] = record.total
      return map
    }, {})

    // Generate all 12 months
    const chartData = []
    for (let month = 1; month <= 12; month++) {
      const date = new Date(year, month - 1, 1)
      const total = recordsMap[month] || 0

      chartData.push({
        year,
        month,
        total,
        displayMonth: date.toLocaleDateString('th-TH', {
          month: 'short',
          timeZone: 'Asia/Bangkok'
        })
      })
    }

    return Response.json({
      success: true,
      data: chartData
    })

  } catch (error) {
    console.error('Error in monthly-chart API:', error)
    return Response.json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายเดือน'
    }, { status: 500 })
  }
}