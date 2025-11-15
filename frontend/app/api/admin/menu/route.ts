import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/server-backend-url'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(getApiUrl('/api/admin/menu'), {
      method: 'GET',
      headers,
      credentials: 'include',
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

// Configure for larger file uploads
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds for large file uploads

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const contentType = request.headers.get('content-type') || ''

    let response: Response

    if (contentType.includes('application/json')) {
      const body = await request.json()
      headers['Content-Type'] = 'application/json'

      response = await fetch(getApiUrl('/api/admin/menu'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(body)
      })
    } else {
      const formData = await request.formData()

      const file = formData.get('menu') as File | null
      if (file) {
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          return NextResponse.json(
            { success: false, error: 'File size must be less than 10MB' },
            { status: 400 }
          )
        }
      }

      response = await fetch(getApiUrl('/api/admin/menu'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData
      })
    }

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 413) {
        return NextResponse.json(
          { success: false, error: 'File is too large. Maximum size is 10MB.' },
          { status: 413 }
        )
      }
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to upload menu' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error uploading menu:', error)
    // Check if it's a size-related error
    if (error.message?.includes('too large') || error.message?.includes('413')) {
      return NextResponse.json(
        { success: false, error: 'File is too large. Maximum size is 10MB.' },
        { status: 413 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to upload menu', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(getApiUrl('/api/admin/menu'), {
      method: 'DELETE',
      headers,
      credentials: 'include',
      cache: 'no-store'
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to delete menu' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error deleting menu:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete menu', message: error.message },
      { status: 500 }
    )
  }
}

