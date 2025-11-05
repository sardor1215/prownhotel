import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/server-backend-url'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(getApiUrl('/api/menu'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to fetch menu' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching menu:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu', message: error.message },
      { status: 500 }
    )
  }
}

