import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/server-backend-url';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params;
    const backendUrl = getApiUrl(`/api/content/${page}`);

    const response = await fetch(backendUrl, {
      cache: 'no-store',
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch content' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


