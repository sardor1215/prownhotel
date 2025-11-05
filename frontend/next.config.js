/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    // Enable image optimization for better performance
    unoptimized: false,
    // Allow SVG images for placeholders
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Allow images from these domains
    domains: [
      'localhost',
      'showercabin-ecommerce.vercel.app',
      'showercabin-backend.vercel.app',
      'royal-shower.vercel.app',
      'royal-shower-backend.vercel.app',
      'images.unsplash.com',
      'orbashower.com',
      'api.orbashower.com'
    ],
    // Allow any image from any domain (use with caution)
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Configure image sizes for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  async rewrites() {
    const isProduction = process.env.NODE_ENV === 'production';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || (isProduction ? 'https://orbashower.com' : 'http://localhost:5000');
    
    return [
      // Note: Next.js API routes in app/api/ take precedence over rewrites
      // Only add specific rewrites here for routes that don't have Next.js API handlers
      // Most API routes are handled by Next.js API routes which proxy to the backend
      
      // Add rewrite for direct uploads in production
      ...(isProduction ? [{
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      }] : []),
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig