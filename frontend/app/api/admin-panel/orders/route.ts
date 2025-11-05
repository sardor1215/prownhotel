import { NextRequest, NextResponse } from 'next/server';

// Hardcoded backend API URL
const API_BASE_URL = 'https://orbashower.com/api';

export async function GET(request: NextRequest) {
  try {
    // Get the admin token from cookies
    const token = request.cookies.get('adminToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    console.log('Fetching orders from backend...');

    // Forward the request to the backend API with token in Authorization header
    const response = await fetch(`${API_BASE_URL}/admin-panel/orders`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      cache: 'no-store' // Prevent caching of admin data
    });

    console.log('Backend response status:', response.status);

    // If the response is not ok, forward the status and error message
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Backend error:', error);
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to fetch orders' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Orders fetched successfully:', data.orders?.length || 0, 'orders');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/admin-panel/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

