import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import { MilkRecord, DailySession, DailySummary } from '../../../../models'
import { getNowThailand } from '../../../../lib/datetime'

// PUT /api/milk-records/[id] - Update milk record
export async function PUT(request, { params }) {
  try {
    await dbConnect()

    const { id } = params
    const body = await request.json()
    const { milkAmount } = body

    // Validation
    if (milkAmount === undefined) {
      return NextResponse.json(
        { error: 'milkAmount is required' },
        { status: 400 }
      )
    }

    if (milkAmount < 0 || milkAmount > 100) {
      return NextResponse.json(
        { error: 'Milk amount must be between 0 and 100 liters' },
        { status: 400 }
      )
    }

    // Find and update the record
    const milkRecord = await MilkRecord.findByIdAndUpdate(
      id,
      {
        milkAmount: parseFloat(milkAmount),
        updatedAt: getNowThailand()
      },
      { new: true, runValidators: true }
    ).populate('cowId', 'name age')

    if (!milkRecord) {
      return NextResponse.json(
        { error: 'Milk record not found' },
        { status: 404 }
      )
    }

    // Update session totals
    await updateSessionTotals(milkRecord.farmId, milkRecord.date, milkRecord.session)

    // Update daily summary
    await updateDailySummary(milkRecord.farmId, milkRecord.cowId._id, milkRecord.date)

    return NextResponse.json({
      success: true,
      data: milkRecord
    })

  } catch (error) {
    console.error('Error updating milk record:', error)
    return NextResponse.json(
      { error: 'Failed to update milk record' },
      { status: 500 }
    )
  }
}

// DELETE /api/milk-records/[id] - Delete milk record
export async function DELETE(request, { params }) {
  try {
    await dbConnect()

    const { id } = params

    // Find the record first
    const milkRecord = await MilkRecord.findById(id)
    if (!milkRecord) {
      return NextResponse.json(
        { error: 'Milk record not found' },
        { status: 404 }
      )
    }

    // Delete the record
    await MilkRecord.findByIdAndDelete(id)

    // Update session totals
    await updateSessionTotals(milkRecord.farmId, milkRecord.date, milkRecord.session)

    // Update daily summary
    await updateDailySummary(milkRecord.farmId, milkRecord.cowId, milkRecord.date)

    return NextResponse.json({
      success: true,
      message: 'Milk record deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting milk record:', error)
    return NextResponse.json(
      { error: 'Failed to delete milk record' },
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

  if (totalMilk === 0) {
    // If no milk records, delete the summary
    await DailySummary.findOneAndDelete({ farmId, cowId, date })
  } else {
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
}