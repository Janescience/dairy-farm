import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import { MilkRecord, DailySession, DailySummary } from '../../../../models'
import { getTodayThailand, getNowThailand } from '../../../../lib/datetime'

export const dynamic = 'force-dynamic'

// POST /api/milk-records/bulk - Create multiple milk records
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
    const { date: providedDate, records } = body
    const date = providedDate || getTodayThailand()

    // Validation
    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'records array is required' },
        { status: 400 }
      )
    }

    // Batch validate records
    const recordKeys = records.map(r => ({ farmId, cowId: r.cowId, date, session: r.session }))
    const existingRecords = await MilkRecord.find({
      $or: recordKeys
    }).lean()

    // Create a Set for faster lookup
    const existingKeys = new Set(
      existingRecords.map(r => `${r.farmId}-${r.cowId}-${r.date}-${r.session}`)
    )

    // Validate each record
    for (const record of records) {
      const { cowId, session, milkAmount } = record

      if (!cowId || !session || milkAmount === undefined) {
        return NextResponse.json(
          { error: 'Each record must have cowId, session, and milkAmount' },
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
      const recordKey = `${farmId}-${cowId}-${date}-${session}`
      if (existingKeys.has(recordKey)) {
        return NextResponse.json(
          { error: `Milk record already exists for cow ${cowId} in ${session} session` },
          { status: 400 }
        )
      }
    }

    // Get unique sessions and create them first
    const uniqueSessions = [...new Set(records.map(r => r.session))]
    const sessionMap = {}

    // Create all sessions in parallel
    await Promise.all(
      uniqueSessions.map(async (session) => {
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
        sessionMap[session] = sessionDoc._id
      })
    )

    // Prepare bulk insert data
    const now = getNowThailand()
    const milkRecordsToInsert = records.map(record => ({
      farmId,
      sessionId: sessionMap[record.session],
      cowId: record.cowId,
      date,
      session: record.session,
      milkAmount: parseFloat(record.milkAmount),
      createdAt: now,
      updatedAt: now
    }))

    // Bulk insert all records
    const createdRecords = await MilkRecord.insertMany(milkRecordsToInsert)

    // Populate cow data for response
    await MilkRecord.populate(createdRecords, { path: 'cowId', select: 'name age' })

    const sessionsToUpdate = new Set(records.map(r => r.session))
    const cowsToUpdateSummary = new Set(records.map(r => r.cowId))

    // Update session totals and daily summaries in parallel
    await Promise.all([
      // Update session totals
      ...Array.from(sessionsToUpdate).map(session =>
        updateSessionTotals(farmId, date, session)
      ),
      // Update daily summaries
      ...Array.from(cowsToUpdateSummary).map(cowId =>
        updateDailySummary(farmId, cowId, date)
      )
    ])

    return NextResponse.json({
      success: true,
      data: createdRecords,
      message: `Successfully created ${createdRecords.length} milk records`
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating bulk milk records:', error)
    return NextResponse.json(
      { error: 'Failed to create milk records' },
      { status: 500 }
    )
  }
}

// Helper functions
async function updateSessionTotals(farmId, date, session) {
  const records = await MilkRecord.find({ farmId, date, session })
  const totalMilk = records.reduce((sum, record) => sum + record.milkAmount, 0)
  const cowCount = records.length

  await DailySession.findOneAndUpdate(
    { farmId, date, session },
    {
      totalMilk,
      cowCount,
      updatedAt: getNowThailand()
    }
  )
}

async function updateDailySummary(farmId, cowId, date) {
  const morningRecord = await MilkRecord.findOne({
    farmId, cowId, date, session: 'morning'
  })

  const eveningRecord = await MilkRecord.findOne({
    farmId, cowId, date, session: 'evening'
  })

  const morningMilk = morningRecord ? morningRecord.milkAmount : 0
  const eveningMilk = eveningRecord ? eveningRecord.milkAmount : 0
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