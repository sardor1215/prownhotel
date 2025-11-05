// This file is used to expose environment variables to the browser
// Note: For local development with local backend, change this to 'http://localhost:5000'
window.env = {
  NEXT_PUBLIC_API_URL: 'https://orbashower.com',
  NODE_ENV: 'development'
};

// Also ensure the global process.env is set correctly for client-side
if (typeof window !== 'undefined') {
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.NODE_ENV = 'development';
  window.process.env.NEXT_PUBLIC_API_URL = 'https://orbashower.com';
}
