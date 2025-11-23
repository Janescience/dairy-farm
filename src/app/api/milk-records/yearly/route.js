import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '../../../../lib/mongodb'
import MilkRecord from '../../../../models/MilkRecord'

export async function GET(request) {
  try {
    // Get farmId from session cookie instead of query params
    const session = request.cookies.get('session')
    if (!session) {
      return NextResponse.json({ success: false, error: 'No active session' }, { status: 401 })
    }

    const sessionData = JSON.parse(session.value)
    const farmId = sessionData.farmId

    if (!farmId) {
      return NextResponse.json({ success: false, error: 'ไม่พบ farmId ใน session' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year'))

    if (!year) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: year'
      }, { status: 400 })
    }

    await dbConnect()

    // Create date strings directly in YYYY-MM-DD format
    const startDateStr = `${year}-01-01`
    const endDateStr = `${year}-12-31`

    // Aggregate yearly total
    const result = await MilkRecord.aggregate([
      {
        $match: {
          farmId: new mongoose.Types.ObjectId(farmId),
          date: {
            $gte: startDateStr,
            $lte: endDateStr
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$milkAmount' },
          count: { $sum: 1 }
        }
      }
    ])

    const data = result.length > 0 ? result[0] : { total: 0, count: 0 }

    return NextResponse.json({
      success: true,
      data: {
        year: year,
        total: data.total || 0,
        count: data.count || 0
      }
    })

  } catch (error) {
    console.error('Error fetching yearly data:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}