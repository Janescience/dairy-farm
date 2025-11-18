import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import { MilkRecord, DailySession, DailySummary } from '../../../models'
import { getTodayThailand, getNowThailand } from '../../../lib/datetime'

// GET /api/milk-records - Get milk records
export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')
    const date = searchParams.get('date') || getTodayThailand()
    const session = searchParams.get('session')

    if (!farmId) {
      return NextResponse.json(
        { error: 'farmId is required' },
        { status: 400 }
      )
    }

    const query = { farmId, date }
    if (session) {
      query.session = session
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

    const body = await request.json()
    const { farmId, sessionId, cowId, session, milkAmount, date: providedDate } = body
    const date = providedDate || getTodayThailand()

    // Validation
    if (!farmId || !cowId || !session || milkAmount === undefined) {
      return NextResponse.json(
        { error: 'farmId, cowId, session, and milkAmount are required' },
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