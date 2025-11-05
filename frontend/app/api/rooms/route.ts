import { NextResponse, NextRequest } from 'next/server';
import { getApiUrl } from '@/lib/server-backend-url';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const apiUrl = getApiUrl(`/api/rooms${queryString ? `?${queryString}` : ''}`);

    console.log('[GET /api/rooms] Fetching from backend:', apiUrl);
    console.log('[GET /api/rooms] Environment:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV
    });

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log('[GET /api/rooms] Response status:', response.status);
    console.log('[GET /api/rooms] Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GET /api/rooms] Backend error:', response.status, errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: `Backend error: ${response.status}`, 
          details: errorText,
          apiUrl: apiUrl // Include the URL for debugging
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[GET /api/rooms] Response data keys:', data ? Object.keys(data) : 'null');

    // Return the data as-is (backend should return rooms array or { success: true, rooms: [...] })
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[GET /api/rooms] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    // Check if it's a connection error
    if (errorName === 'AbortError' || errorMessage.includes('fetch')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to connect to backend server', 
          message: 'The backend server may not be running or is unreachable. Please check if the backend is running on port 5001 (or 5002 if nginx is proxying).',
          details: errorMessage
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        message: errorMessage,
        details: errorName
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

