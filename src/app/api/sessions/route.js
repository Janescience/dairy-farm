import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import { DailySession } from '../../../models'
import { getTodayThailand, getNowThailand } from '../../../lib/datetime'

// GET /api/sessions - Get or create today's sessions
export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')
    const date = searchParams.get('date') || getTodayThailand()

    if (!farmId) {
      return NextResponse.json(
        { error: 'farmId is required' },
        { status: 400 }
      )
    }

    // Get or create sessions for today
    const sessions = await Promise.all([
      DailySession.findOneAndUpdate(
        { farmId, date, session: 'morning' },
        {
          farmId,
          date,
          session: 'morning',
          isCompleted: false,
          totalMilk: 0,
          cowCount: 0
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      ),
      DailySession.findOneAndUpdate(
        { farmId, date, session: 'evening' },
        {
          farmId,
          date,
          session: 'evening',
          isCompleted: false,
          totalMilk: 0,
          cowCount: 0
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      )
    ])

    return NextResponse.json({
      success: true,
      data: {
        morning: sessions[0],
        evening: sessions[1]
      }
    })

  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}