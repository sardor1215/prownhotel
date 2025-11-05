# Image Loading Fix for Production

## Problem
Images were not showing in production mode after build due to incorrect URL construction and Next.js configuration issues.

## Solutions Implemented

### 1. Updated Image URL Construction (`app/utils/image.ts`)
- Fixed production URL construction to use proper backend URLs
- Added support for rewrite rules in production
- Improved fallback handling

### 2. Updated Next.js Configuration (`next.config.js`)
- Enabled image optimization (`unoptimized: false`)
- Added `dangerouslyAllowSVG: true` to allow SVG placeholder images
- Added proper domain configuration for `orbashower.com`
- Added rewrite rules for direct image serving in production
- Configured image sizes and formats for better performance

### 3. Updated Image Components
- Standardized all image components to use `getImageUrl()` function
- Fixed components that were using direct `<img>` tags
- Improved error handling and fallback images

### 4. Updated Image Proxy (`app/api/image-proxy/route.ts`)
- **FIXED**: Corrected backend URL construction to remove `/api` prefix
- Improved error handling for 404 images
- Better placeholder image serving
- Enhanced logging for debugging

### 5. Fixed Admin Authentication System
- **FIXED**: Updated middleware to properly handle admin routes
- **FIXED**: Implemented cookie-based authentication instead of localStorage tokens
- **FIXED**: Created proper login/logout API routes
- **FIXED**: Updated admin dashboard to use cookie authentication
- **ADDED**: Debugging logs to track authentication flow
- **ADDED**: Test page for debugging authentication issues

## Environment Variables Required

For production deployment, ensure these environment variables are set:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=https://orbashower.com

# App URL (optional)
NEXT_PUBLIC_APP_URL=https://orbashower.com

# Node environment
NODE_ENV=production
```

## Testing

### Image Loading Test
Use the test page at `/test-images` to verify image loading functionality:

1. Build the project: `npm run build`
2. Start production server: `npm start`
3. Navigate to `/test-images` to test image loading

### Admin Authentication Test
Use the test page at `/admin/test-auth` to debug authentication issues:

1. Navigate to `/admin/test-auth`
2. Check authentication status
3. Test login/logout functionality
4. Verify cookie setting and clearing

## Key Changes Made

1. **Image URL Construction**: Now uses rewrite rules in production for better performance
2. **Next.js Config**: Enabled image optimization and added proper domain configuration
3. **Component Updates**: All components now use consistent image loading approach
4. **Error Handling**: Improved fallback to placeholder images when images fail to load
5. **SVG Support**: Added `dangerouslyAllowSVG: true` to allow SVG placeholder images
6. **Authentication**: Fixed admin login system with proper cookie-based auth
7. **Debugging**: Added comprehensive logging and test pages

## Files Modified

- `app/utils/image.ts` - Main image URL construction logic
- `next.config.js` - Next.js configuration for images and rewrites
- `app/api/image-proxy/route.ts` - Image proxy improvements (FIXED backend URL)
- `app/components/ui/Image.tsx` - Image component updates
- `middleware.ts` - Fixed admin authentication routing with debugging
- `app/api/admin-auth/login/route.ts` - Updated to set proper cookies with debugging
- `app/api/admin-auth/logout/route.ts` - New logout API route
- `app/admin/login/page.tsx` - Updated to use cookie-based auth with debugging
- `app/admin/dashboard/page.tsx` - Updated to use cookie-based auth
- `app/admin/test-auth/page.tsx` - New test page for debugging authentication
- Various component files - Standardized image loading

## Recent Fixes (Latest)

### Backend URL Construction Fix
- **Problem**: Images were trying to load from `http://localhost:5000/api/uploads/` instead of `http://localhost:5000/uploads/`
- **Solution**: Updated image proxy to remove `/api` prefix from backend URL
- **Result**: Images now load correctly in development mode

### SVG Placeholder Support
- **Problem**: SVG placeholder images were blocked by Next.js security policy
- **Solution**: Added `dangerouslyAllowSVG: true` and proper CSP configuration
- **Result**: Placeholder images now display correctly

### Admin Authentication Fix
- **Problem**: Admin login was redirecting to wrong URL and not working properly
- **Solution**: 
  - Fixed middleware to redirect admin routes to `/admin/login` instead of `/login`
  - Implemented cookie-based authentication instead of localStorage tokens
  - Created proper login/logout API routes
  - Updated all admin components to use cookie authentication
  - Added comprehensive debugging logs
  - Created test page for authentication debugging
- **Result**: Admin login now works correctly in both development and production

## Notes

- Images in production now use rewrite rules for better performance
- Images in development use the image proxy with corrected backend URL
- Placeholder images are served from `/images/placeholder-shower.svg`
- All image loading is now consistent across the application
- Build process has been fixed by removing problematic `500.tsx` file
- Admin authentication now uses secure httpOnly cookies
- Debugging logs help identify authentication issues

## Debugging

### Image Loading Issues
If images still don't load, check the browser console for:
1. Image proxy logs showing the constructed URLs
2. Network tab to see if requests are being made to correct endpoints
3. Environment variables are set correctly
4. Backend server is running and serving images from `/uploads/` directory

### Admin Authentication Issues
If admin login doesn't work:
1. Navigate to `/admin/test-auth` to check authentication status
2. Check browser console for authentication errors and debugging logs
3. Verify backend admin authentication endpoints are working
4. Check that cookies are being set properly in browser dev tools
5. Ensure middleware is not blocking admin routes
6. Check the Network tab for API call responses

### Common Issues and Solutions

#### Cookie Not Being Set
- Check if the domain matches (localhost vs production domain)
- Verify `secure` flag is only set in production
- Check browser console for cookie-related errors

#### Middleware Redirects
- Check middleware logs in browser console
- Verify token cookie is present and valid
- Check if redirect URLs are correct

#### API Calls Failing
- Verify environment variables are set correctly
- Check if backend server is running
- Look for CORS errors in browser console
