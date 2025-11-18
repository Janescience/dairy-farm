import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import { Farm, Cow } from '../../../models'
import { getNowThailand } from '../../../lib/datetime'

export async function GET() {
  try {
    await dbConnect()

    // Create sample farm
    const farm = await Farm.create({
      name: 'Halem Farm',
      location: 'สูงเนิน',
      owner: 'นายฮาเล็ม',
      isActive: true,
      createdAt: getNowThailand(),
      updatedAt: getNowThailand()
    })

    // Create sample cows
    const cows = await Cow.insertMany([
      {
        farmId: farm._id,
        name: 'โอเลี้ยง',
        age: 10,
        isActive: true,
        createdAt: getNowThailand(),
        updatedAt: getNowThailand()
      }
    ])

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      data: {
        farm,
        cows: cows.length
      }
    })

  } catch (error) {
    console.error('Error creating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    )
  }
}