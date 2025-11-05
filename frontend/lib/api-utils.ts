import { API_URL, getHeaders } from './api-config';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Makes a GET request to the specified endpoint
 * @param endpoint The API endpoint (without base URL)
 * @param params Optional URL parameters to replace in the endpoint
 * @param customHeaders Optional custom headers
 */
export async function get<T>(endpoint: string, params: Record<string, string | number> = {}, customHeaders: Record<string, string> = {}): Promise<T> {
  try {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${API_URL.BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(customHeaders),
    });

    return handleApiResponse<T>(response);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Makes a POST request to the specified endpoint
 * @param endpoint The API endpoint (without base URL)
 * @param data The data to send in the request body
 * @param customHeaders Optional custom headers
 */
export async function post<T>(
  endpoint: string, 
  data: any, 
  customHeaders: Record<string, string> = {}
): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL.BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json',
        ...customHeaders,
      }),
      body: JSON.stringify(data),
    });

    return handleApiResponse<T>(response);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Makes a PUT request to the specified endpoint
 * @param endpoint The API endpoint (without base URL)
 * @param data The data to send in the request body
 * @param customHeaders Optional custom headers
 */
export async function put<T>(
  endpoint: string, 
  data: any, 
  customHeaders: Record<string, string> = {}
): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL.BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders({
        'Content-Type': 'application/json',
        ...customHeaders,
      }),
      body: JSON.stringify(data),
    });

    return handleApiResponse<T>(response);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Makes a DELETE request to the specified endpoint
 * @param endpoint The API endpoint (without base URL)
 * @param customHeaders Optional custom headers
 */
export async function del<T>(
  endpoint: string, 
  customHeaders: Record<string, string> = {}
): Promise<T> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL.BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(customHeaders),
    });

    return handleApiResponse<T>(response);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Handles API response and throws an error if the response is not ok
 * @param response The fetch response object
 * @private
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = response.statusText || 'An error occurred';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // If we can't parse the error as JSON, use the status text
    }
    
    throw new Error(errorMessage);
  }
  
  // For 204 No Content responses, return an empty object
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

/**
 * Handles API errors and returns a consistent error object
 * @param error The error that occurred
 * @private
 */
function handleApiError(error: unknown): never {
  console.error('API Error:', error);
  throw error instanceof Error 
    ? error 
    : new Error('An unknown error occurred');
}

// Export utility functions as named exports
export { handleApiResponse, handleApiError };

// Default export for backward compatibility
export default {
  get,
  post,
  put,
  delete: del,
  handleApiResponse,
  handleApiError,
};
