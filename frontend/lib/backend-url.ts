/**
 * Get the backend base URL for API calls and image serving
 * Auto-detects from environment variable or current origin
 */
export function getBackendUrl(): string {
  // First, try environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
  if (apiUrl) {
    // Remove trailing slash and /api suffix if present
    return apiUrl.replace(/\/api$/, '').replace(/\/$/, '')
  }
  
  // Client-side: Auto-detect from current origin
  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin
    const currentHost = window.location.hostname
    
    // If frontend is on port 3000, assume backend is on port 5000
    if (currentOrigin.includes(':3000')) {
      return currentOrigin.replace(':3000', ':5000')
    }
    
    // If localhost, default to localhost:5000
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return 'http://localhost:5000'
    }
    
    // For other hosts (like IP addresses), use same host with port 5000
    if (currentHost.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      // IP address detected
      return `http://${currentHost}:5000`
    }
    
    // For domain names, assume backend is on same domain but port 5000
    // This is a fallback - should ideally use environment variable
    return `http://${currentHost}:5000`
  }
  
  // Server-side: Default to localhost:5000
  return 'http://localhost:5000'
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

