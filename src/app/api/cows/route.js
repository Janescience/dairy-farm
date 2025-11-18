import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import { Cow } from '../../../models'
import { getNowThailand } from '../../../lib/datetime'

// GET /api/cows - Get all cows
export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')

    if (!farmId) {
      return NextResponse.json(
        { error: 'farmId is required' },
        { status: 400 }
      )
    }

    const cows = await Cow.find({ farmId, isActive: true })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: cows
    })

  } catch (error) {
    console.error('Error fetching cows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cows' },
      { status: 500 }
    )
  }
}

// POST /api/cows - Create new cow
export async function POST(request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { farmId, name, age } = body

    // Validation
    if (!farmId || !name) {
      return NextResponse.json(
        { error: 'farmId and name are required' },
        { status: 400 }
      )
    }

    // Set default age if not provided
    const cowAge = age !== undefined ? parseInt(age) : 0

    if (cowAge < 0 || cowAge > 30) {
      return NextResponse.json(
        { error: 'Age must be between 0 and 30' },
        { status: 400 }
      )
    }

    // Check if cow name already exists in this farm
    const existingCow = await Cow.findOne({
      farmId,
      name: name.trim(),
      isActive: true
    })

    if (existingCow) {
      return NextResponse.json(
        { error: 'Cow name already exists in this farm' },
        { status: 400 }
      )
    }

    const cow = await Cow.create({
      farmId,
      name: name.trim(),
      age: cowAge,
      isActive: true,
      createdAt: getNowThailand(),
      updatedAt: getNowThailand()
    })

    return NextResponse.json({
      success: true,
      data: cow
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating cow:', error)
    return NextResponse.json(
      { error: 'Failed to create cow' },
      { status: 500 }
    )
  }
}