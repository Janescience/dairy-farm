import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import { Farm, User } from '../../../models'
import { getNowThailand } from '../../../lib/datetime'

// GET /api/farms - Get all farms
export async function GET() {
  try {
    await dbConnect()

    const farms = await Farm.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: farms
    })

  } catch (error) {
    console.error('Error fetching farms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch farms' },
      { status: 500 }
    )
  }
}

// POST /api/farms - Create new farm
export async function POST(request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { name, location, owner } = body

    // Validation
    if (!name || !location || !owner) {
      return NextResponse.json(
        { error: 'name, location, and owner are required' },
        { status: 400 }
      )
    }

    const farm = await Farm.create({
      name: name.trim(),
      location: location.trim(),
      owner: owner.trim(),
      isActive: true,
      createdAt: getNowThailand(),
      updatedAt: getNowThailand()
    })

    // Create owner and employee users for this farm
    const farmName = name.trim()
    const users = await User.insertMany([
      {
        username: `${farmName}-owner`,
        password: '123456',
        farmId: farm._id,
        role: 'owner',
        isActive: true,
        createdAt: getNowThailand(),
        updatedAt: getNowThailand()
      },
      {
        username: `${farmName}-employee`,
        password: '123456',
        farmId: farm._id,
        role: 'employee',
        isActive: true,
        createdAt: getNowThailand(),
        updatedAt: getNowThailand()
      }
    ])

    return NextResponse.json({
      success: true,
      data: {
        farm,
        users: users.map(u => ({ username: u.username, role: u.role }))
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating farm:', error)
    return NextResponse.json(
      { error: 'Failed to create farm' },
      { status: 500 }
    )
  }
}