import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import { Cow } from '../../../../models'
import { getNowThailand } from '../../../../lib/datetime'

// GET /api/cows/[id] - Get cow by ID
export async function GET(request, { params }) {
  try {
    await dbConnect()

    const { id } = params

    // Find the cow
    const cow = await Cow.findOne({
      _id: id,
      isActive: true
    }).populate('farmId', 'name location owner')

    if (!cow) {
      return NextResponse.json(
        { error: 'Cow not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: cow
    })

  } catch (error) {
    console.error('Error fetching cow:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cow' },
      { status: 500 }
    )
  }
}

// PUT /api/cows/[id] - Update cow
export async function PUT(request, { params }) {
  try {
    await dbConnect()

    const { id } = params
    const body = await request.json()
    const { name, age, gender, birthDate, entryDate, purchasePrice } = body

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    if (age !== undefined && (age < 0 || age > 30)) {
      return NextResponse.json(
        { error: 'Age must be between 0 and 30' },
        { status: 400 }
      )
    }

    // Find the cow
    const cow = await Cow.findById(id)
    if (!cow) {
      return NextResponse.json(
        { error: 'Cow not found' },
        { status: 404 }
      )
    }

    // Check if name already exists in this farm (excluding current cow)
    const existingCow = await Cow.findOne({
      farmId: cow.farmId,
      name: name.trim(),
      isActive: true,
      _id: { $ne: id }
    })

    if (existingCow) {
      return NextResponse.json(
        { error: 'Cow name already exists in this farm' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      updatedAt: getNowThailand()
    }

    if (age !== undefined) updateData.age = parseInt(age)
    if (gender) updateData.gender = gender
    if (birthDate) updateData.birthDate = birthDate
    if (entryDate) updateData.entryDate = entryDate
    if (purchasePrice !== undefined) updateData.purchasePrice = parseFloat(purchasePrice)

    // Update cow
    const updatedCow = await Cow.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      data: updatedCow
    })

  } catch (error) {
    console.error('Error updating cow:', error)
    return NextResponse.json(
      { error: 'Failed to update cow' },
      { status: 500 }
    )
  }
}

// DELETE /api/cows/[id] - Soft delete cow
export async function DELETE(request, { params }) {
  try {
    await dbConnect()

    const { id } = params

    // Find the cow
    const cow = await Cow.findById(id)
    if (!cow) {
      return NextResponse.json(
        { error: 'Cow not found' },
        { status: 404 }
      )
    }

    // Soft delete (set isActive to false)
    const updatedCow = await Cow.findByIdAndUpdate(
      id,
      {
        isActive: false,
        updatedAt: getNowThailand()
      },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Cow deleted successfully',
      data: updatedCow
    })

  } catch (error) {
    console.error('Error deleting cow:', error)
    return NextResponse.json(
      { error: 'Failed to delete cow' },
      { status: 500 }
    )
  }
}