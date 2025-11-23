import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import { MilkRecord, DailySession, DailySummary } from '../../../models'
import { getTodayThailand, getNowThailand } from '../../../lib/datetime'

export const dynamic = 'force-dynamic'

// GET /api/milk-records - Get milk records
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
    const sessionType = searchParams.get('session')

    const query = { farmId, date }
    if (sessionType) {
      query.session = sessionType
    }

    const records = await MilkRecord.find(query)
      .populate('cowId', 'name age')
      .sort({ createdAt: 1 })
      .lean()


    return NextResponse.json({
      success: true,
      data: records
    })

  } catch (error) {
    console.error('Error fetching milk records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch milk records' },
      { status: 500 }
    )
  }
}

// POST /api/milk-records - Create milk record
export async function POST(request) {
  try {
    await dbConnect()

    // Get farmId from session cookie instead of request body
    const sessionCookie = request.cookies.get('session')
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'No active session' }, { status: 401 })
    }

    const sessionData = JSON.parse(sessionCookie.value)
    const farmId = sessionData.farmId

    if (!farmId) {
      return NextResponse.json({ success: false, error: 'ไม่พบ farmId ใน session' }, { status: 400 })
    }

    const body = await request.json()
    const { sessionId, cowId, session, milkAmount, date: providedDate } = body
    const date = providedDate || getTodayThailand()

    // Validation
    if (!cowId || !session || milkAmount === undefined) {
      return NextResponse.json(
        { error: 'cowId, session, and milkAmount are required' },
        { status: 400 }
      )
    }

    if (milkAmount < 0 || milkAmount > 100) {
      return NextResponse.json(
        { error: 'Milk amount must be between 0 and 100 liters' },
        { status: 400 }
      )
    }

    // Check if record already exists
    const existingRecord = await MilkRecord.findOne({
      farmId,
      cowId,
      date,
      session
    }).lean()

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Milk record already exists for this cow in this session' },
        { status: 400 }
      )
    }

    // Get or create session if sessionId not provided
    let finalSessionId = sessionId
    if (!finalSessionId) {
      const sessionDoc = await DailySession.findOneAndUpdate(
        { farmId, date, session },
        {
          farmId,
          date,
          session,
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
      finalSessionId = sessionDoc._id
    }

    // Create milk record
    const milkRecord = await MilkRecord.create({
      farmId,
      sessionId: finalSessionId,
      cowId,
      date,
      session,
      milkAmount: parseFloat(milkAmount),
      createdAt: getNowThailand(),
      updatedAt: getNowThailand()
    })

    // Update session totals
    await updateSessionTotals(farmId, date, session)

    // Update daily summary
    await updateDailySummary(farmId, cowId, date)

    // Populate cow data for response
    await milkRecord.populate('cowId', 'name age')

    return NextResponse.json({
      success: true,
      data: milkRecord
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating milk record:', error)
    return NextResponse.json(
      { error: 'Failed to create milk record' },
      { status: 500 }
    )
  }
}

// Helper functions
async function updateSessionTotals(farmId, date, session) {
  const aggregateResult = await MilkRecord.aggregate([
    { $match: { farmId, date, session } },
    {
      $group: {
        _id: null,
        totalMilk: { $sum: '$milkAmount' },
        cowCount: { $sum: 1 }
      }
    }
  ])

  const result = aggregateResult[0] || { totalMilk: 0, cowCount: 0 }

  await DailySession.findOneAndUpdate(
    { farmId, date, session },
    {
      totalMilk: result.totalMilk,
      cowCount: result.cowCount,
      updatedAt: getNowThailand()
    }
  )
}

async function updateDailySummary(farmId, cowId, date) {
  const records = await MilkRecord.find({
    farmId, cowId, date
  }, 'session milkAmount').lean()

  const morningMilk = records.find(r => r.session === 'morning')?.milkAmount || 0
  const eveningMilk = records.find(r => r.session === 'evening')?.milkAmount || 0
  const totalMilk = morningMilk + eveningMilk

  await DailySummary.findOneAndUpdate(
    { farmId, cowId, date },
    {
      farmId,
      cowId,
      date,
      morningMilk,
      eveningMilk,
      totalMilk,
      updatedAt: getNowThailand()
    },
    { upsert: true, new: true }
  )
}