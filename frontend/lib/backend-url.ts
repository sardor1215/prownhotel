/**
 * Get the backend base URL for API calls and image serving
 * Uses NEXT_PUBLIC_API_URL environment variable or falls back to production URL
 */
export function getBackendUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
  if (apiUrl) {
    // Remove trailing slash and /api suffix if present
    return apiUrl.replace(/\/api$/, '').replace(/\/$/, '')
  }
  
  // Default fallback - update this to your production backend URL
  return 'https://orbashower.com'
}

/**
 * Get the full image URL from a backend path
 */
export function getImageUrl(imagePath: string | undefined): string {
  if (!imagePath) return '/imgtouse/1.JPG' // Fallback image
  
  // If it's already a full URL, use it
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  const backendUrl = getBackendUrl()
  
  // If it's a server path like /uploads/rooms/filename.jpg
  if (imagePath.startsWith('/uploads/')) {
    return `${backendUrl}${imagePath}`
  }
  
  // If it's just a filename, construct the full path
  if (!imagePath.startsWith('/')) {
    return `${backendUrl}/uploads/rooms/${imagePath}`
  }
  
  // Fallback to imgtouse if it's an old path
  if (imagePath.includes('imgtouse')) {
    return imagePath
  }
  
  // Default: prepend backend URL
  return `${backendUrl}${imagePath}`
}

/**
 * Get the API URL for making requests
 */
export function getApiUrl(endpoint: string): string {
  const backendUrl = getBackendUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${backendUrl}${cleanEndpoint}`
}

