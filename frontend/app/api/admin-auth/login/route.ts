import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/server-backend-url';

export async function POST(request: Request) {
  console.log('=== Login API Route Called ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    if (!body.email || !body.password) {
      console.error('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const apiUrl = getApiUrl('/api/admin-auth/login');
    
    console.log('Forwarding login request to:', apiUrl);
    
    // Forward the request to the backend server
    const response = await fetch(apiUrl, {
      method: 'POST',
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password
      }),
    });

    // Get response headers before reading the body
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', responseHeaders);

    // Try to parse response as JSON, but fallback to text if it fails
    let data;
    try {
      data = await response.json();
      console.log('Backend response data:', data);
    } catch (jsonError) {
      const textResponse = await response.text();
      console.error('Failed to parse JSON response:', textResponse);
      return NextResponse.json(
        { 
          error: 'Invalid response from server',
          details: textResponse
        },
        { status: 500 }
      );
    }

    // Build response for client
    const nextResponse = new NextResponse(
      JSON.stringify({
        success: response.ok,
        message: data.message || (response.ok ? 'Login successful' : 'Login failed'),
        admin: data.admin,
        error: data.error,
      }),
      {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    // Set a same-origin HttpOnly cookie on the frontend domain using the backend-returned token
    if (response.ok && data?.token) {
      console.log('Setting adminToken cookie with:', {
        tokenPrefix: data.token.substring(0, 20) + '...',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      
      nextResponse.cookies.set('adminToken', data.token, {
        httpOnly: true,
        secure: true, // Always use secure in HTTPS
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      
      console.log('Cookie set successfully');
    } else {
      console.warn('No token found in backend response body; cannot set adminToken cookie.');
    }

    return nextResponse;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
