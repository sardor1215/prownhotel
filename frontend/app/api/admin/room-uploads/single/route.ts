import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/server-backend-url'

// Configure for larger file uploads (up to 10MB)
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    
    // Check file size before forwarding
    const file = formData.get('image') as File | null
    if (file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: 'File size must be less than 10MB' },
          { status: 400 }
        )
      }
    }

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    }
    // Don't set Content-Type for FormData - let fetch set it with boundary

    const response = await fetch(getApiUrl('/api/admin/room-uploads/single'), {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle 413 specifically
      if (response.status === 413) {
        return NextResponse.json(
          { success: false, error: 'File is too large. Maximum size is 10MB.' },
          { status: 413 }
        )
      }
      // Handle 401 specifically
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Authentication failed. Please login again.' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to upload image' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error uploading room image:', error)
    // Check if it's a size-related error
    if (error.message?.includes('too large') || error.message?.includes('413')) {
      return NextResponse.json(
        { success: false, error: 'File is too large. Maximum size is 10MB.' },
        { status: 413 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to upload image', message: error.message },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

