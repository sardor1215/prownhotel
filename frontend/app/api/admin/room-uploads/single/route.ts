import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/server-backend-url'

// Configure for larger file uploads (up to 10MB)
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    // Try to get token from multiple sources
    let token = request.cookies.get('adminToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.headers.get('x-authorization')?.replace('Bearer ', '')

    // If still no token, try to read from the request body (for FormData)
    // Note: We can't read FormData twice, so we'll handle this differently
    if (!token) {
      // Try to get from query string as a last resort (not recommended but works)
      const url = new URL(request.url)
      const tokenFromQuery = url.searchParams.get('token')
      
      if (tokenFromQuery) {
        token = tokenFromQuery
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided. Please login again.' },
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
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type for FormData - let fetch set it with boundary
      // But we can set other headers
    }
    
    // Log the token being sent (first 20 chars only for security)
    console.log('[Room Upload API] Sending token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')

    const backendUrl = getApiUrl('/api/admin/room-uploads/single')
    console.log('[Room Upload API] Forwarding to backend:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData
    })
    
    console.log('[Room Upload API] Backend response status:', response.status)

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

