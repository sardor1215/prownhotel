import { NextRequest, NextResponse } from 'next/server';

// Hardcoded backend API URL
const API_BASE_URL = 'https://orbashower.com/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to get token from Authorization header first, then from cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Check for token in cookies
      token = request.cookies.get('adminToken')?.value;
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    console.log('Fetching product:', params.id);

    const response = await fetch(`${API_BASE_URL}/admin-panel/products/${params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Backend error:', error);
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to fetch product' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Product fetched successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to get token from Authorization header first, then from cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Check for token in cookies
      token = request.cookies.get('adminToken')?.value;
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Updating product:', params.id);

    const response = await fetch(`${API_BASE_URL}/admin-panel/products/${params.id}`, {
      method: 'PUT',
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
        { error: error.error || error.message || 'Failed to update product' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Product updated successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to get token from Authorization header first, then from cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Check for token in cookies
      token = request.cookies.get('adminToken')?.value;
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    console.log('Deleting product:', params.id);

    const response = await fetch(`${API_BASE_URL}/admin-panel/products/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Backend error:', error);
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to delete product' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Product deleted successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

