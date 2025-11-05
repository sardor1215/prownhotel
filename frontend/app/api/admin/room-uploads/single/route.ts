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
    console.log('[Room Upload API] Environment:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV
    })
    
    // Warn if using localhost in production
    if (backendUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
      console.warn('[Room Upload API] WARNING: Using localhost backend URL in production. This will not work on Vercel.')
    }

    // Create an AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    let response: Response
    try {
      response = await fetch(backendUrl, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
        signal: controller.signal
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.error('[Room Upload API] Request timeout after 30 seconds')
        return NextResponse.json(
          { success: false, error: 'Request timeout. The backend server may be unreachable or too slow.' },
          { status: 504 }
        )
      }
      console.error('[Room Upload API] Fetch error:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to connect to backend server. Please check if the backend is running and accessible.' },
        { status: 503 }
      )
    }
    
    console.log('[Room Upload API] Backend response status:', response.status)
    console.log('[Room Upload API] Backend response content-type:', response.headers.get('content-type'))

    // Try to parse response as JSON, handle both JSON and HTML error pages
    let data: any = null
    try {
      const responseText = await response.text()
      
      // Try to parse as JSON
      try {
        data = JSON.parse(responseText)
      } catch (jsonError) {
        // If JSON parsing fails, it might be an HTML error page
        console.error('[Room Upload API] Failed to parse JSON response. Response preview:', responseText.substring(0, 500))
        console.error('[Room Upload API] JSON parse error:', jsonError)
        
        // Check if it looks like HTML
        if (responseText.trim().startsWith('<')) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Backend returned an HTML error page. This usually indicates a server error. Please check backend logs.',
              details: responseText.substring(0, 200) // Include first 200 chars for debugging
            },
            { status: response.status || 500 }
          )
        }
        
        // If it's not HTML, return generic error
        return NextResponse.json(
          { success: false, error: 'Backend returned an invalid response format. Please check server configuration.' },
          { status: response.status || 500 }
        )
      }
    } catch (error: any) {
      console.error('[Room Upload API] Error reading response:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to read backend response. Please try again.' },
        { status: 500 }
      )
    }

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
      // Handle 500 specifically
      if (response.status === 500) {
        return NextResponse.json(
          { success: false, error: data?.error || 'Internal server error on backend. Please try again later.' },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { success: false, error: data?.error || 'Failed to upload image' },
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

