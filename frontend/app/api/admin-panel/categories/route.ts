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

    console.log('Fetching categories from backend...');

    // Forward the request to the backend API with token in Authorization header
    const response = await fetch(`${API_BASE_URL}/admin-panel/categories`, {
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
        { error: error.error || error.message || 'Failed to fetch categories' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Categories fetched successfully:', data.categories?.length || 0, 'categories');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/admin-panel/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Creating category...');

    const response = await fetch(`${API_BASE_URL}/admin-panel/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Backend error:', error);
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to create category' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Category created successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

