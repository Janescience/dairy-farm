import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import { User } from '../../../../models'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user with farm data
    const user = await User.findOne({
      username: username.trim(),
      isActive: true
    }).populate('farmId', 'name location owner')

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create session data
    const sessionData = {
      userId: user._id,
      username: user.username,
      role: user.role,
      farmId: user.farmId._id,
      farmName: user.farmId.name
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: sessionData
    })

    // Set session cookie (never expires until manual logout)
    response.cookies.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 10 // 10 years (effectively never expires)
    })

    return response

  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}