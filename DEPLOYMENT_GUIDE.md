# Deployment Guide - Backend & Frontend URLs

## Overview

All hardcoded `localhost:5000` URLs have been replaced with environment-based configuration. The application now uses a centralized utility to determine the backend URL.

## Configuration

### Environment Variable

Set the `NEXT_PUBLIC_API_URL` environment variable to your backend URL:

**For Development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**For Production:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### How It Works

1. **Client-side code** uses `frontend/lib/backend-url.ts`:
   - `getBackendUrl()` - Gets the base backend URL
   - `getImageUrl()` - Constructs image URLs
   - `getApiUrl()` - Constructs API endpoint URLs

2. **Server-side API routes** use `frontend/lib/server-backend-url.ts`:
   - Same functions, but for Next.js API routes

### Default Fallback

If `NEXT_PUBLIC_API_URL` is not set, the application defaults to:
- `https://orbashower.com` (update this in `backend-url.ts` and `server-backend-url.ts` if needed)

## Files Updated

### Core Utilities
- ✅ `frontend/lib/backend-url.ts` - Client-side URL utilities
- ✅ `frontend/lib/server-backend-url.ts` - Server-side URL utilities

### Main Pages
- ✅ `frontend/app/page.tsx` - Homepage
- ✅ `frontend/app/rooms/page.tsx` - Rooms listing
- ✅ `frontend/app/rooms/[id]/book/page.tsx` - Booking page
- ✅ `frontend/app/restaurant/page.tsx` - Restaurant page
- ✅ `frontend/app/menu/page.tsx` - Menu page
- ✅ `frontend/app/reservations/[id]/page.tsx` - Reservation confirmation

### Admin Pages
- ✅ `frontend/app/admin/rooms/page.tsx` - Admin rooms list
- ✅ `frontend/app/admin/rooms/[id]/edit/page.tsx` - Edit room
- ✅ `frontend/app/admin/rooms/new/page.tsx` - New room
- ✅ `frontend/app/admin/room-types/page.tsx` - Room types
- ✅ `frontend/app/admin/menu/page.tsx` - Menu management
- ✅ `frontend/app/admin/reservations/[id]/page.tsx` - Reservation details

### API Routes
- ✅ `frontend/app/api/menu/route.ts` - Menu API proxy
- ✅ `frontend/app/api/admin/menu/route.ts` - Admin menu API proxy
- ✅ All other API routes already use `server-backend-url.ts`

## Deployment Steps

### 1. Set Environment Variable

**Vercel/Netlify:**
- Go to project settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-domain.com`

**Docker/Server:**
- Add to `.env.local` or `.env.production`:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend-domain.com
  ```

### 2. Update Default Fallback (Optional)

If you want to change the default fallback URL, edit:
- `frontend/lib/backend-url.ts` (line 14)
- `frontend/lib/server-backend-url.ts` (line 14)

### 3. Build & Deploy

```bash
cd frontend
npm run build
npm start
```

## Testing

After deployment, verify:
1. ✅ Images load correctly (check room images)
2. ✅ API calls work (test booking, admin login)
3. ✅ Menu PDF opens correctly
4. ✅ All API routes respond properly

## Notes

- The URL utilities automatically handle:
  - Removing trailing slashes
  - Removing `/api` suffix if present
  - Constructing proper image URLs
  - Building API endpoint URLs

- No environment checks (development/production) are performed
- Simply uses `NEXT_PUBLIC_API_URL` if set, otherwise uses default fallback

