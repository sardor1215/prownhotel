import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { searchParams } = url;
  let imagePath = searchParams.get('path');
  
  console.log('Received request for image:', { 
    originalUrl: request.url,
    path: imagePath,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  if (!imagePath) {
    const error = { error: 'Image path is required', receivedUrl: request.url };
    console.error('Error:', error);
    return new NextResponse(JSON.stringify(error), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Decode the URL-encoded path
    imagePath = decodeURIComponent(imagePath);
    
    // Normalize the path to handle different formats
    imagePath = imagePath
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(/\\/g, '/') // Convert backslashes to forward slashes for URLs
      .replace(/\/\//g, '/') // Remove any double slashes that might occur
      .trim();
    
    // Ensure the path is within the uploads directory for security
    if (imagePath.includes('..') || !imagePath.startsWith('uploads/')) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid image path',
        path: imagePath
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { getBackendUrl } = await import('@/lib/server-backend-url');
    const baseBackendUrl = getBackendUrl();
    
    // Log environment info for debugging
    console.log('Environment:', {
      backendUrl: baseBackendUrl,
      host: request.headers.get('host')
    });
    
    // Construct the full URL - handle both local and production paths
    const normalizedBackendUrl = baseBackendUrl.endsWith('/') ? baseBackendUrl.slice(0, -1) : baseBackendUrl;
    
    // Ensure the path starts with uploads/
    let normalizedImagePath = imagePath;
    if (!normalizedImagePath.startsWith('uploads/')) {
      normalizedImagePath = `uploads/${normalizedImagePath}`;
    }
    
    // Ensure we don't have double slashes
    normalizedImagePath = normalizedImagePath.replace(/^\/+/, '');
    
    // Construct the final URL
    const imageUrl = `${normalizedBackendUrl}/${normalizedImagePath}`;
    
    console.log('Constructed image URL:', {
      originalPath: imagePath,
      normalizedPath: normalizedImagePath,
      finalUrl: imageUrl
    });
    
    // Fetch the image from the backend with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      console.log('Attempting to fetch image from:', imageUrl);
      
      let response;
      try {
        response = await fetch(imageUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
          },
          cache: 'no-store' // Prevent caching of 404 responses
        });
        
        clearTimeout(timeoutId);
        console.log('Fetch response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Could not read error response');
          console.error('Image fetch failed:', {
            status: response.status,
            statusText: response.statusText,
            url: imageUrl,
            error: errorText,
            headers: Object.fromEntries(response.headers.entries())
          });
          
          // If the image is not found, try to serve a placeholder image
          if (response.status === 404) {
            const placeholderUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://orbashower.com'}/images/placeholder-shower.svg`;
            console.log(`Image not found (404), trying to serve placeholder from: ${placeholderUrl}`);
            
            try {
              const placeholderResponse = await fetch(placeholderUrl);
              
              if (placeholderResponse.ok) {
                const imageBuffer = await placeholderResponse.arrayBuffer();
                return new NextResponse(imageBuffer, {
                  status: 200,
                  headers: {
                    'Content-Type': 'image/svg+xml',
                    'X-Image-Status': 'not-found',
                    'X-Original-Image-Url': imageUrl,
                    'Cache-Control': 'public, max-age=60' // Cache placeholder for a short time
                  }
                });
              } else {
                console.error('Failed to fetch placeholder:', {
                  status: placeholderResponse.status,
                  statusText: placeholderResponse.statusText,
                  url: placeholderUrl
                });
              }
            } catch (placeholderError) {
              console.error('Error fetching placeholder:', placeholderError);
            }
            
            // If we can't serve a placeholder, return the original error
            return new NextResponse(JSON.stringify({ 
              error: 'Failed to fetch image', 
              status: response.status,
              statusText: response.statusText,
              url: imageUrl,
              resolvedUrl: imageUrl
            }), { 
              status: response.status,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          // For other error status codes
          return new NextResponse(JSON.stringify({ 
            error: 'Failed to fetch image', 
            status: response.status,
            statusText: response.statusText,
            url: imageUrl,
            resolvedUrl: imageUrl
          }), { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      
      // Get the image data
      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      
      // Return the image with appropriate headers
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Image-Status': 'ok'
        }
      });
      
      } catch (error) {
        clearTimeout(timeoutId);
        const fetchError = error as Error & { name?: string };
        console.error('Error in fetch operation:', fetchError);
        
        if (fetchError.name === 'AbortError') {
          console.error('Image fetch timed out:', imageUrl);
          return new NextResponse(JSON.stringify({ 
            error: 'Request timed out',
            url: imageUrl
          }), { 
            status: 408,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return new NextResponse(JSON.stringify({ 
          error: 'Error fetching image',
          details: fetchError.message || 'Unknown error occurred',
          url: imageUrl
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      const err = error as Error;
      console.error('Unexpected error in image proxy:', err);
      return new NextResponse(JSON.stringify({ 
        error: 'Internal server error',
        details: err.message || 'Unknown error occurred'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Use Edge Runtime for better performance
export const runtime = 'edge';
