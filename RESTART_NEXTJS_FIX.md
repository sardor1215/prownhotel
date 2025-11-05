# Fix Next.js 404 on Dynamic Route

## The Problem
`PUT http://localhost:3000/api/admin/room-types/2` returns 404

This is a **Next.js issue**, not a backend issue. The dynamic route `[id]` isn't being recognized.

## Solution: Clear Cache & Restart

### Step 1: Stop Next.js
Press `Ctrl+C` in the frontend terminal

### Step 2: Delete .next folder
```bash
cd frontend
rm -rf .next
# Or on Windows PowerShell:
Remove-Item -Recurse -Force .next
```

### Step 3: Restart Next.js
```bash
npm run dev
```

## Why This Happens
Next.js caches route information. When you add a new dynamic route `[id]`, it sometimes doesn't pick it up until you:
1. Clear the `.next` cache folder
2. Do a full restart

## Verify the Route File Exists
The file should be at:
```
frontend/app/api/admin/room-types/[id]/route.ts
```

## After Restart
1. Try editing a room type again
2. Check browser Network tab - should show 200 OK (or 401/500, but NOT 404)
3. Check Next.js terminal for any route errors

## If Still 404
Check the Next.js terminal for:
- Build errors
- TypeScript errors
- Route compilation messages


