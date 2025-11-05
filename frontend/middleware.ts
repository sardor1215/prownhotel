import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isAuthPath = request.nextUrl.pathname.startsWith('/login')
  const isApiAuthPath = request.nextUrl.pathname.startsWith('/api/admin-auth')
  const isAdminLoginPath = request.nextUrl.pathname === '/admin/login'
  const isPublicPath = [
    '/',
    '/products',
    '/products/[id]',
    '/about',
    '/contact',
    '/api/cart',
  ].some(path => request.nextUrl.pathname.startsWith(path))

  // Skip middleware for API auth routes and public paths
  if (isApiAuthPath || isPublicPath) {
    return NextResponse.next()
  }

  // Debug logging
  console.log('Middleware check:', {
    pathname: request.nextUrl.pathname,
    hasToken: !!token,
    isAdminPath,
    isAuthPath,
    isAdminLoginPath,
    tokenLength: token?.length || 0
  });

  // If user is not authenticated and tries to access admin routes
  if (isAdminPath && !token && !isAdminLoginPath) {
    console.log('Redirecting to admin login - no token found');
    const adminLoginUrl = new URL('/admin/login', request.url)
    adminLoginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(adminLoginUrl)
  }

  // If user is authenticated and tries to access login pages
  if ((isAuthPath || isAdminLoginPath) && token) {
    console.log('Redirecting authenticated user from login page');
    const from = request.nextUrl.searchParams.get('from') || '/admin/dashboard'
    return NextResponse.redirect(new URL(from, request.url))
  }

  // For all other cases, continue with the request
  console.log('Middleware allowing request through');
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/* (image files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
    // Explicitly include admin paths
    '/admin/:path*',
    '/login',
  ],
}
