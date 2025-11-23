import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const session = request.cookies.get('session')

    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    const sessionData = JSON.parse(session.value)

    return NextResponse.json({
      success: true,
      data: sessionData
    })

  } catch (error) {
    console.error('Error getting session:', error)
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    )
  }
}