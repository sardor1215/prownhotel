import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/server-backend-url';

export async function POST(request: Request) {
  try {
    const apiUrl = getApiUrl('/api/admin-auth/logout');
    
    // Call the backend logout endpoint
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Create response
    const nextResponse = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    
    // Clear the authentication cookie
    nextResponse.cookies.set('token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return nextResponse;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
