# Authentication Fix - Admin Panel

## Problem
The admin panel was getting "401 Unauthorized" errors because:
1. Token was being set as an httpOnly cookie (can't be read by JavaScript)
2. Frontend pages were trying to read from `localStorage` with wrong key
3. Direct calls to backend API without proper authentication

## Solution
Created frontend API proxy routes that:
1. Read the httpOnly `adminToken` cookie server-side
2. Forward requests to backend with proper Authorization header
3. Handle authentication transparently

---

## What Was Fixed

### 1. Backend Routes Added
- ✅ `/api/room-types` - Public room types endpoint
- ✅ `/api/admin/room-types` - Admin room types CRUD

### 2. Frontend API Proxy Routes Created
All routes read the `adminToken` cookie and forward to backend:

**Public Routes:**
- `/api/room-types` - Get all room types
- `/api/reservations` - Get all reservations
- `/api/reservations/[id]` - Update reservation

**Admin Routes (require authentication):**
- `/api/admin/rooms` - Get all rooms
- `/api/admin/rooms/[id]` - Update/delete room
- `/api/admin/room-types` - Get/create room types
- `/api/admin/room-types/[id]` - Update/delete room type

### 3. Frontend Pages Updated
All admin pages now use frontend API routes instead of direct backend calls:
- ✅ `dashboard/page.tsx`
- ✅ `rooms/page.tsx`
- ✅ `room-types/page.tsx`
- ✅ `reservations/page.tsx`

---

## How to Test

### 1. Restart Backend
```bash
cd backend
npm run dev
```

Backend should show:
- ✅ `🚀 Server running on port 5000`
- ✅ `✅ Database connection successful!`

### 2. Restart Frontend
```bash
cd frontend
npm run dev
```

### 3. Clear Browser Data
**Important!** Clear cookies and localStorage:
1. Open DevTools (F12)
2. Go to Application tab
3. Clear all cookies for localhost:3000
4. Clear localStorage

### 4. Login
1. Go to: http://localhost:3000/admin/login
2. Login with:
   - Email: `admin@hotel.com`
   - Password: `admin123`

### 5. Test Features
After login, all pages should work:
- ✅ Dashboard shows stats
- ✅ Rooms page displays rooms
- ✅ Room Types page shows types
- ✅ Reservations page shows bookings

---

## Authentication Flow

```
┌──────────────┐
│ User Login   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Frontend: /api/admin-auth/login      │
└──────┬───────────────────────────────┘
       │ Forward request
       ▼
┌──────────────────────────────────────┐
│ Backend: /api/admin-auth/login       │
│ - Verify credentials                 │
│ - Generate JWT token                 │
│ - Set adminToken cookie              │
└──────┬───────────────────────────────┘
       │ Return token
       ▼
┌──────────────────────────────────────┐
│ Frontend: Set adminToken cookie      │
│ (httpOnly, secure in production)     │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ User redirected to Dashboard         │
└──────────────────────────────────────┘
```

---

## Authenticated API Calls

```
┌──────────────────────────────────────┐
│ Admin Page (e.g., /admin/rooms)      │
│ fetch('/api/admin/rooms')            │
└──────┬───────────────────────────────┘
       │ Cookie automatically sent
       ▼
┌──────────────────────────────────────┐
│ Frontend API: /api/admin/rooms       │
│ - Read adminToken from cookie        │
│ - Check if token exists              │
└──────┬───────────────────────────────┘
       │ Forward with Authorization header
       ▼
┌──────────────────────────────────────┐
│ Backend API: /api/admin/rooms        │
│ - Verify JWT token                   │
│ - Check admin exists                 │
│ - Return data                        │
└──────┬───────────────────────────────┘
       │ Return data
       ▼
┌──────────────────────────────────────┐
│ Frontend API: Return to client       │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Admin Page: Display data             │
└──────────────────────────────────────┘
```

---

## Troubleshooting

### Issue: Still getting 401 errors

**Solution:**
1. Clear browser cookies and localStorage
2. Log out and log in again
3. Check browser console for errors

### Issue: "Failed to fetch rooms/room types"

**Solution:**
1. Make sure backend is running on port 5000
2. Check backend console for errors
3. Verify database has tables and data

### Issue: Login works but dashboard is empty

**Solution:**
1. Check if database has data:
   ```sql
   SELECT * FROM admins;
   SELECT * FROM room_types;
   SELECT * FROM rooms;
   SELECT * FROM reservations;
   ```

2. Add sample data if needed:
   ```bash
   cd backend
   node scripts/create-hotel-tables.js
   ```

### Issue: "Cookie not found"

**Solution:**
1. Check if login response sets cookie (Network tab in DevTools)
2. Verify cookie is httpOnly and path is '/'
3. Make sure you're on localhost:3000 (not 127.0.0.1)

---

## Cookie Details

The `adminToken` cookie is set with:
```javascript
{
  httpOnly: true,              // Can't be read by JavaScript
  secure: false,               // Set to true in production
  sameSite: 'lax',            // CSRF protection
  maxAge: 7 * 24 * 60 * 60,  // 7 days
  path: '/',                  // Available for all routes
}
```

---

## Security Notes

✅ **Secure:**
- Token stored in httpOnly cookie (XSS protected)
- Token verified on every request
- Admin existence checked in database
- CORS properly configured

⚠️ **Development Only:**
- `secure: false` for localhost
- In production, set `secure: true` for HTTPS

---

## API Endpoints Summary

### Backend (Port 5000)

**Public:**
- `GET /api/room-types` - Get all room types
- `GET /api/rooms` - Get all rooms
- `GET /api/reservations` - Get all reservations

**Admin (requires auth):**
- `GET /api/admin/rooms` - Get all rooms (admin view)
- `POST /api/admin/rooms` - Create room
- `PUT /api/admin/rooms/:id` - Update room
- `DELETE /api/admin/rooms/:id` - Delete room

- `GET /api/admin/room-types` - Get all room types
- `POST /api/admin/room-types` - Create room type
- `PUT /api/admin/room-types/:id` - Update room type
- `DELETE /api/admin/room-types/:id` - Delete room type

### Frontend (Port 3000)

All routes are proxies that handle authentication automatically:

- `/api/room-types` → `backend/api/room-types`
- `/api/reservations` → `backend/api/reservations`
- `/api/admin/rooms` → `backend/api/admin/rooms`
- `/api/admin/room-types` → `backend/api/admin/room-types`

---

## Success Checklist

After following this guide, you should be able to:
- [x] Login to admin panel
- [x] See dashboard with statistics
- [x] View all rooms
- [x] Toggle room availability
- [x] View room types
- [x] Create/edit/delete room types
- [x] View reservations
- [x] Update reservation status

---

**Last Updated:** November 4, 2025
**Status:** ✅ Authentication Fixed

