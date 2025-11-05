# Backend Route Debug - Room Types

## Issue
GET/PUT/DELETE requests to `http://localhost:5000/api/admin/room-types/2` return 404

## Route Registration
The route is registered at:
- Line 364 in `server.js`: `app.use("/api/admin/room-types", adminRoomTypesRoutes);`

## Route Handler
The route file `backend/routes/admin-room-types.js` has:
- ✅ `router.put('/:id', ...)` - Update room type
- ✅ `router.delete('/:id', ...)` - Delete room type
- ✅ `router.get('/')` - Get all room types
- ✅ `router.post('/')` - Create room type

## Solution

### 1. Restart Backend Server

The backend server needs to be restarted to pick up the route:

```bash
# Stop the backend server (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

### 2. Verify Route is Working

After restart, test with:

```bash
# Test GET (should work)
curl http://localhost:5000/api/admin/room-types

# Test PUT (with auth token)
curl -X PUT http://localhost:5000/api/admin/room-types/2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","max_adults":2,"max_children":0}'
```

### 3. Check Backend Console

Look for:
- Route registration messages
- Any errors when server starts
- Request logs when you hit the endpoint

### 4. Verify Middleware

The route uses `adminAuth` middleware, so make sure:
- You're sending the Authorization header with a valid token
- The token is from the admin login

## Expected Behavior

After restart:
- `PUT /api/admin/room-types/2` should work (with auth)
- `DELETE /api/admin/room-types/2` should work (with auth)
- `GET /api/admin/room-types` should work (with auth)

