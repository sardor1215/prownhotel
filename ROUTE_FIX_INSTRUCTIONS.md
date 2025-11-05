# Fix for 404 Error on `/api/admin/room-types/[id]`

## Problem
Getting `404 Not Found` when calling `PUT /api/admin/room-types/2`

## Solution

### 1. **Restart Next.js Dev Server**

The route file exists but Next.js needs to be restarted to recognize it:

```bash
# Stop the frontend server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

### 2. **Verify Route File Exists**

The route should be at:
```
frontend/app/api/admin/room-types/[id]/route.ts
```

### 3. **Clear Next.js Cache (if still not working)**

```bash
cd frontend
rm -rf .next
npm run dev
```

### 4. **Test the Route**

After restart, test with:
- Browser: `http://localhost:3000/api/admin/room-types/2` (GET)
- Or use the edit modal in the admin panel

### 5. **Check Console**

Look for logs in the Next.js terminal:
- `[PUT] Updating room type: { id, apiUrl }`
- Any errors

## Route Configuration

The route file exports:
- ✅ `PUT` - Update room type
- ✅ `DELETE` - Delete room type  
- ✅ `GET` - Get single room type (for testing)

All methods:
- Read `adminToken` cookie
- Forward to backend at `http://localhost:5000/api/admin/room-types/{id}`
- Handle async params properly

## If Still Not Working

1. Check Next.js version:
   ```bash
   cd frontend
   npm list next
   ```

2. Verify the route file syntax is correct (no TypeScript errors)

3. Check browser console for errors

4. Check Next.js terminal for route registration messages

