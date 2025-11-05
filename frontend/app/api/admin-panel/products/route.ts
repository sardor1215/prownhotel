import { NextResponse } from 'next/server';

// Hardcoded backend API URL
const API_BASE_URL = 'https://orbashower.com/api';

export async function GET(request: Request) {
  try {
    // Try to get token from Authorization header first, then from cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Check for token in cookies
      const cookieHeader = request.headers.get('cookie');
      const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies?.adminToken;
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    console.log('Fetching products from backend...');

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/admin-panel/products`, {
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
        { error: error.error || error.message || 'Failed to fetch products' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Products fetched successfully:', data.products?.length || 0, 'products');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/admin-panel/products:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Try to get token from Authorization header first, then from cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Check for token in cookies
      const cookieHeader = request.headers.get('cookie');
      const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies?.adminToken;
    }
    
    if (!token) {
      console.error('No token found');
      return NextResponse.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Forwarding product creation request to backend');
    
    const response = await fetch(`${API_BASE_URL}/admin-panel/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Backend returned error:', {
        status: response.status,
        statusText: response.statusText,
        error
      });
      return NextResponse.json(
        { message: error.message || 'Failed to create product' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Product created successfully:', { id: data.id });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin-panel/products:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
