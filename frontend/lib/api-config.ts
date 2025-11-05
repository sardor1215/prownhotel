// API configuration for the application

// Hardcoded API URL pointing to production backend
const API_BASE_URL = 'https://orbashower.com/api';

// Ensure the API URL ends with a slash
const BASE_URL = API_BASE_URL.endsWith('/') 
  ? API_BASE_URL.slice(0, -1) 
  : API_BASE_URL;

// Export the base API URL
export const API_URL = {
  BASE: BASE_URL,
  AUTH: `${BASE_URL}/auth`,
  PRODUCTS: `${BASE_URL}/products`,
  CATEGORIES: `${BASE_URL}/categories`,
  ORDERS: `${BASE_URL}/orders`,
  ADMIN: `${BASE_URL}/admin`,
  UPLOAD: `${BASE_URL}/upload`,
};

// Helper function to get the full URL for an API endpoint
export const getApiUrl = (endpoint: string, params: Record<string, string | number> = {}) => {
  let url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  // Replace URL parameters if any
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });
  
  return url;
};

// Default headers for API requests
export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Helper to merge headers
export const getHeaders = (customHeaders: Record<string, string> = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  
  return {
    ...defaultHeaders,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...customHeaders,
  };
};
