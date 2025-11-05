import { NextResponse } from 'next/server';

// This route must be dynamic to handle different time periods and paths
export const dynamic = 'force-dynamic';

// Hardcoded backend API URL
const API_BASE_URL = 'https://orbashower.com/api';

export async function GET(request: Request) {
  try {
    // Get the search params from the URL
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';
    const period = searchParams.get('period') || 'weekly';
    
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/admin/analytics/${path}?period=${period}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.message || 'Failed to fetch analytics data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
