/**
 * Get the backend base URL for server-side API routes
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
 * Get the API URL for making requests
 */
export function getApiUrl(endpoint: string): string {
  const backendUrl = getBackendUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${backendUrl}${cleanEndpoint}`
}

