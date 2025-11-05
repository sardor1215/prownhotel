# 🍪 Cookie Issue Fix

## The Problem

The backend login is successful (200 OK) and returns a token, but after redirect you're sent back to the login page. This happens because:

1. ✅ Backend returns token with `Domain=.orbashower.com; Secure`
2. ❌ This cookie **only works** on `orbashower.com` domain
3. ❌ It **doesn't work** on `localhost:3000`
4. ✅ Next.js API route sets its own cookie for localhost
5. ❌ But middleware runs before cookie is fully set

## The Solution

I've made two fixes:

### Fix 1: Added Cookie Logging
The login API route now logs when it sets the cookie so you can verify it's working.

### Fix 2: Hard Redirect Instead of Soft Redirect  
Changed from `router.push()` to `window.location.href` to ensure cookies are properly included in the next request.

## How to Test

### Step 1: Restart Dev Server
```bash
# Stop (Ctrl+C)
cd frontend
npm run dev
```

### Step 2: Clear Browser Data
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Cookies** → `http://localhost:3000`
4. Delete all cookies
5. Also click **Local Storage** → Clear

### Step 3: Try Login
1. Go to `http://localhost:3000/admin/login`
2. Open Console (F12 → Console)
3. Try logging in
4. Watch the console logs

### Step 4: Check Console Logs

You should see:
```
✅ Login response status: 200
✅ Login response data: { success: true, ... }
✅ Setting adminToken cookie with: { ... }
✅ Cookie set successfully
✅ Stored admin user in localStorage
✅ Login successful, redirecting to: /admin/dashboard
```

### Step 5: Check Cookies

After login, in DevTools:
1. Go to **Application** tab
2. Click **Cookies** → `http://localhost:3000`
3. Look for `adminToken` cookie
4. ✅ It should be there with a JWT token value

### Step 6: Check Middleware

After redirect, in terminal you should see:
```
Middleware check: {
  pathname: '/admin/dashboard',
  hasToken: true,  ← Should be TRUE!
  isAdminPath: true,
  tokenLength: 150+ ← Should have a length
}
Middleware allowing request through
```

## If Still Not Working

### Debug Step 1: Check if Cookie is Being Set

Add this to browser console after login:
```javascript
document.cookie.split(';').forEach(c => console.log(c.trim()));
```

Look for `adminToken=...`

### Debug Step 2: Manual Cookie Test

In browser console on login page:
```javascript
// Set a test cookie
document.cookie = "testCookie=hello; path=/";

// Check if it was set
console.log('Cookies:', document.cookie);
```

If `testCookie` doesn't appear, there's a browser cookie issue.

### Debug Step 3: Check Middleware

Add a console.log to see what cookies middleware receives:
```javascript
// In middleware.ts (line 6)
console.log('All cookies:', request.cookies.getAll());
```

### Debug Step 4: Check Response Headers

In Network tab after login:
1. Click on the `/api/admin-auth/login` request
2. Go to **Response Headers**
3. Look for `Set-Cookie` header
4. Should see: `adminToken=...; Path=/; HttpOnly; SameSite=Lax`

## Alternative Solution: Use localStorage

If cookies still don't work, we can use localStorage as a fallback:

### Option A: Modify Middleware to Check localStorage

This isn't ideal (can't access localStorage in middleware), so we'd need to:
1. Remove middleware cookie check
2. Check token in each protected page
3. Or use a different auth strategy

### Option B: Use Authorization Header

1. Store token in localStorage (already doing this)
2. Send token in Authorization header
3. Update middleware to check header

## Expected Behavior After Fix

### ✅ Login Success Flow:
```
1. Enter credentials → Submit
2. Call /api/admin-auth/login
3. Backend validates → Returns 200 + token
4. Next.js sets cookie: adminToken=...
5. Store admin data in localStorage
6. Wait 100ms for cookie to be set
7. Hard redirect: window.location.href = '/admin/dashboard'
8. Browser requests /admin/dashboard with cookies
9. Middleware checks: adminToken cookie exists ✅
10. Middleware allows request through ✅
11. Dashboard loads ✅
```

### ❌ What Was Happening Before:
```
1. Enter credentials → Submit
2. Call /api/admin-auth/login
3. Backend validates → Returns 200 + token
4. Next.js tries to set cookie
5. Soft redirect: router.push('/admin/dashboard')
6. Browser requests /admin/dashboard (cookie not included)
7. Middleware checks: No adminToken cookie ❌
8. Middleware redirects back to /admin/login ❌
9. Loop! ❌
```

## Quick Commands

### Restart Server:
```bash
cd frontend
npm run dev
```

### Clear Cookies (in browser console):
```javascript
document.cookie.split(';').forEach(c => {
  document.cookie = c.split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
});
```

### Check Cookies:
```javascript
console.log('All cookies:', document.cookie);
```

### Check localStorage:
```javascript
console.log('Admin user:', localStorage.getItem('adminUser'));
```

## Summary of Changes

### File: `frontend/app/api/admin-auth/login/route.ts`
- ✅ Added detailed logging when setting cookie
- ✅ Shows cookie configuration

### File: `frontend/app/admin/login/page.tsx`
- ✅ Added 100ms delay before redirect
- ✅ Changed to `window.location.href` for hard redirect
- ✅ Ensures cookies are included in next request

## Next Steps

1. ✅ Restart dev server
2. ✅ Clear browser cookies and localStorage  
3. ✅ Try login again
4. ✅ Check console logs
5. ✅ Verify cookies are set
6. ✅ Should stay on dashboard!

---

**The key change: Using `window.location.href` instead of `router.push()` to ensure cookies are sent with the redirect!**

