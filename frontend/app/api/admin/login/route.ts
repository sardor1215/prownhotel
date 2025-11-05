import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/server-backend-url';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const apiUrl = getApiUrl('/api/admin-auth/login');
    
    console.log('Forwarding login request to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password
      }),
    });

    const data = await response.json().catch(() => ({
      error: 'Invalid JSON response from server'
    }));

    console.log('Backend response status:', response.status);
    console.log('Backend response data:', data);

    if (response.ok) {
      const responseData = {
        message: data.message || 'Login successful',
        admin: data.admin,
        token: data.token
      };

      const nextResponse = NextResponse.json(responseData, { status: 200 });
      
      if (data.token) {
        nextResponse.cookies.set('token', data.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });
      }

      return nextResponse;
    }

    return NextResponse.json(
      { error: data.error || 'Login failed' },
      { status: response.status || 500 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
