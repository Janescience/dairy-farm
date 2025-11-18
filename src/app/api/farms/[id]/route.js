import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import { Farm } from '../../../../models'
import { getNowThailand } from '../../../../lib/datetime'

// GET /api/farms/[id] - Get farm by ID
export async function GET(request, { params }) {
  try {
    await dbConnect()

    const { id } = params

    const farm = await Farm.findOne({
      _id: id,
      isActive: true
    })

    if (!farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: farm
    })

  } catch (error) {
    console.error('Error fetching farm:', error)
    return NextResponse.json(
      { error: 'Failed to fetch farm' },
      { status: 500 }
    )
  }
}

// PUT /api/farms/[id] - Update farm
export async function PUT(request, { params }) {
  try {
    await dbConnect()

    const { id } = params
    const body = await request.json()
    const { name, location, owner } = body

    // Validation
    if (!name || !location || !owner) {
      return NextResponse.json(
        { error: 'name, location, and owner are required' },
        { status: 400 }
      )
    }

    // Find the farm
    const farm = await Farm.findById(id)
    if (!farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      )
    }

    // Update farm
    const updatedFarm = await Farm.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        location: location.trim(),
        owner: owner.trim(),
        updatedAt: getNowThailand()
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      data: updatedFarm
    })

  } catch (error) {
    console.error('Error updating farm:', error)
    return NextResponse.json(
      { error: 'Failed to update farm' },
      { status: 500 }
    )
  }
}

// DELETE /api/farms/[id] - Soft delete farm
export async function DELETE(request, { params }) {
  try {
    await dbConnect()

    const { id } = params

    // Find the farm
    const farm = await Farm.findById(id)
    if (!farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      )
    }

    // Soft delete (set isActive to false)
    const updatedFarm = await Farm.findByIdAndUpdate(
      id,
      {
        isActive: false,
        updatedAt: getNowThailand()
      },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Farm deleted successfully',
      data: updatedFarm
    })

  } catch (error) {
    console.error('Error deleting farm:', error)
    return NextResponse.json(
      { error: 'Failed to delete farm' },
      { status: 500 }
    )
  }
}