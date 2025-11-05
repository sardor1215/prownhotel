import { NextRequest, NextResponse } from 'next/server';

// Hardcoded backend API URL
const API_BASE_URL = 'https://orbashower.com/api';

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  const params = await Promise.resolve(context.params);
  try {
    const token = request.cookies.get('adminToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Updating category:', params.id);

    const response = await fetch(`${API_BASE_URL}/admin-panel/categories/${params.id}`, {
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
        { error: error.error || error.message || 'Failed to update category' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Category updated successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  const params = await Promise.resolve(context.params);
  try {
    const token = request.cookies.get('adminToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    console.log('Deleting category:', params.id);

    const response = await fetch(`${API_BASE_URL}/admin-panel/categories/${params.id}`, {
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
        { error: error.error || error.message || 'Failed to delete category' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Category deleted successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

