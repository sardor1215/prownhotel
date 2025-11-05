import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/server-backend-url';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    console.log('🖼️ [Image Proxy] Requested filename:', filename);
    
    const backendUrl = getBackendUrl();
    const imageUrl = `${backendUrl}/uploads/rooms/${filename}`;
    
    console.log('🖼️ [Image Proxy] Fetching from backend:', imageUrl);
    
    // Fetch the image from backend
    const response = await fetch(imageUrl, {
      headers: {
        'Accept': 'image/*',
      },
    });

    console.log('🖼️ [Image Proxy] Backend response status:', response.status);

    if (!response.ok) {
      console.error('❌ [Image Proxy] Backend error:', response.status, response.statusText);
      return new NextResponse('Image not found', { status: 404 });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    
    // Get content type from backend response
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    console.log('✅ [Image Proxy] Image proxied successfully:', filename, 'Type:', contentType);

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('❌ [Image Proxy] Error:', error);
    return new NextResponse('Error loading image', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';


