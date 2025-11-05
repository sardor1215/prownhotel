import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    message: 'Test route works!',
    id: params.id,
    path: '/api/test-route/[id]'
  });
}

export const dynamic = 'force-dynamic';


