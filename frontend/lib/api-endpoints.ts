import { API_URL } from './api-config';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_URL.AUTH}/login`,
  REGISTER: `${API_URL.AUTH}/register`,
  VERIFY: `${API_URL.AUTH}/verify`,
  REFRESH: `${API_URL.AUTH}/refresh`,
  LOGOUT: `${API_URL.AUTH}/logout`,
  FORGOT_PASSWORD: `${API_URL.AUTH}/forgot-password`,
  RESET_PASSWORD: `${API_URL.AUTH}/reset-password`,
};

// Product endpoints
export const PRODUCT_ENDPOINTS = {
  BASE: API_URL.PRODUCTS,
  FEATURED: `${API_URL.PRODUCTS}/featured`,
  CATEGORY: (categoryId: string | number) => `${API_URL.PRODUCTS}/category/${categoryId}`,
  DETAIL: (productId: string | number) => `${API_URL.PRODUCTS}/${productId}`,
  SEARCH: (query: string) => `${API_URL.PRODUCTS}/search?q=${encodeURIComponent(query)}`,
};

// Category endpoints
export const CATEGORY_ENDPOINTS = {
  BASE: API_URL.CATEGORIES,
  FEATURED: `${API_URL.CATEGORIES}/featured`,
  DETAIL: (categoryId: string | number) => `${API_URL.CATEGORIES}/${categoryId}`,
  PRODUCTS: (categoryId: string | number) => `${API_URL.CATEGORIES}/${categoryId}/products`,
};

// Cart endpoints
export const CART_ENDPOINTS = {
  BASE: `${API_URL.BASE}/cart`,
  ITEMS: `${API_URL.BASE}/cart/items`,
  ITEM: (itemId: string | number) => `${API_URL.BASE}/cart/items/${itemId}`,
  CLEAR: `${API_URL.BASE}/cart/clear`,
  COUNT: `${API_URL.BASE}/cart/count`,
};

// Order endpoints
export const ORDER_ENDPOINTS = {
  BASE: API_URL.ORDERS,
  USER_ORDERS: `${API_URL.ORDERS}/my-orders`,
  DETAIL: (orderId: string | number) => `${API_URL.ORDERS}/${orderId}`,
  CANCEL: (orderId: string | number) => `${API_URL.ORDERS}/${orderId}/cancel`,
  STATUS: (orderId: string | number) => `${API_URL.ORDERS}/${orderId}/status`,
  CHECKOUT: `${API_URL.ORDERS}/checkout`,
  VERIFY: (orderId: string | number) => `${API_URL.ORDERS}/${orderId}/verify`,
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  // Products
  PRODUCTS: {
    BASE: `${API_URL.ADMIN}/products`,
    DETAIL: (productId: string | number) => `${API_URL.ADMIN}/products/${productId}`,
    STATS: `${API_URL.ADMIN}/products/stats`,
  },
  
  // Categories
  CATEGORIES: {
    BASE: `${API_URL.ADMIN}/categories`,
    DETAIL: (categoryId: string | number) => `${API_URL.ADMIN}/categories/${categoryId}`,
  },
  
  // Orders
  ORDERS: {
    BASE: `${API_URL.ADMIN}/orders`,
    DETAIL: (orderId: string | number) => `${API_URL.ADMIN}/orders/${orderId}`,
    STATUS: (orderId: string | number) => `${API_URL.ADMIN}/orders/${orderId}/status`,
    STATS: `${API_URL.ADMIN}/orders/stats`,
  },
  
  // Users
  USERS: {
    BASE: `${API_URL.ADMIN}/users`,
    DETAIL: (userId: string | number) => `${API_URL.ADMIN}/users/${userId}`,
    STATS: `${API_URL.ADMIN}/users/stats`,
  },
  
  // Analytics
  ANALYTICS: {
    OVERVIEW: `${API_URL.ADMIN}/analytics/overview`,
    SALES: `${API_URL.ADMIN}/analytics/sales`,
    PRODUCTS: `${API_URL.ADMIN}/analytics/products`,
    CUSTOMERS: `${API_URL.ADMIN}/analytics/customers`,
  },
};

// Upload endpoints
export const UPLOAD_ENDPOINTS = {
  BASE: API_URL.UPLOAD,
  IMAGE: `${API_URL.UPLOAD}/image`,
  IMAGES: `${API_URL.UPLOAD}/images`,
  DELETE: (filename: string) => `${API_URL.UPLOAD}/${filename}`,
};

// Export all endpoints as a single object
export default {
  auth: AUTH_ENDPOINTS,
  products: PRODUCT_ENDPOINTS,
  categories: CATEGORY_ENDPOINTS,
  cart: CART_ENDPOINTS,
  orders: ORDER_ENDPOINTS,
  admin: ADMIN_ENDPOINTS,
  upload: UPLOAD_ENDPOINTS,
};
