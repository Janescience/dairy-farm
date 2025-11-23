import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import { DailySession } from '../../../models'
import { getTodayThailand, getNowThailand } from '../../../lib/datetime'

export const dynamic = 'force-dynamic'

// GET /api/sessions - Get or create today's sessions
export async function GET(request) {
  try {
    await dbConnect()

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
    const date = searchParams.get('date') || getTodayThailand()

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