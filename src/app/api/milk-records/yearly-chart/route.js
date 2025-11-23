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
    const years = parseInt(searchParams.get('years')) || 5

    const currentYear = new Date().getFullYear()
    const startYear = currentYear - (years - 1)

    // Aggregate milk records for all years
    const records = await MilkRecord.aggregate([
      {
        $match: {
          farmId: new mongoose.Types.ObjectId(farmId),
          date: {
            $gte: `${startYear}-01-01`,
            $lt: `${currentYear + 1}-01-01`
          }
        }
      },
      {
        $addFields: {
          year: { $year: { $dateFromString: { dateString: '$date' } } }
        }
      },
      {
        $group: {
          _id: '$year',
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

    // Generate all years
    const chartData = []
    for (let i = 0; i < years; i++) {
      const year = startYear + i
      const total = recordsMap[year] || 0

      chartData.push({
        year,
        total,
        displayYear: year.toString()
      })
    }

    return Response.json({
      success: true,
      data: chartData
    })

  } catch (error) {
    console.error('Error in yearly-chart API:', error)
    return Response.json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายปี'
    }, { status: 500 })
  }
}