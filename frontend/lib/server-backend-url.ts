/**
 * Get the backend base URL for server-side API routes
 * Auto-detects from environment variable or defaults to localhost
 */
export function getBackendUrl(): string {
  // First, try environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
  if (apiUrl) {
    // Remove trailing slash and /api suffix if present
    return apiUrl.replace(/\/api$/, '').replace(/\/$/, '')
  }
  
  // Default to localhost:5001 for server-side (nginx proxy on 5001, backend on 5002)
  // This allows nginx to add CORS headers and handle static files
  return 'http://localhost:5001'
}

/**
 * Get the API URL for making requests
 */
export function getApiUrl(endpoint: string): string {
  const backendUrl = getBackendUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${backendUrl}${cleanEndpoint}`
}

