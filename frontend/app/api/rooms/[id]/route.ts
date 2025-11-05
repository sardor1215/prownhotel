import { NextResponse, NextRequest } from 'next/server';
import { getApiUrl } from '@/lib/server-backend-url';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiUrl = getApiUrl(`/api/rooms/${id}`);

    console.log('[GET /api/rooms/[id]] Fetching from backend:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GET /api/rooms/[id]] Backend error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the data as-is (backend should return { success: true, room: {...} })
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[GET /api/rooms/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

