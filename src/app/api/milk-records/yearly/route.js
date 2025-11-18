import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '../../../../lib/mongodb'
import MilkRecord from '../../../../models/MilkRecord'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')
    const year = parseInt(searchParams.get('year'))

    if (!farmId || !year) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: farmId, year'
      }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid farmId format'
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