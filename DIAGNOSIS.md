# 🔍 Login Diagnosis Guide

## Understanding the Login Flow

### ✅ CORRECT Flow (This is how it should work):

```
1. Browser (localhost:3000/admin/login)
   ↓
   Makes request to: http://localhost:3000/api/admin-auth/login
   ↓
2. Next.js API Route (frontend/app/api/admin-auth/login/route.ts)
   ↓
   Forwards request to: https://orbashower.com/api/admin-auth/login
   ↓
3. Backend (orbashower.com)
   ↓
   Validates credentials, returns token
   ↓
4. Next.js API Route
   ↓
   Sets cookie, returns response
   ↓
5. Browser
   ↓
   Redirects to /admin/dashboard ✅
```

## ⚠️ What You're Seeing is NORMAL!

When you see:
```
Request URL: http://localhost:3000/api/admin-auth/login
```

This is **CORRECT**! The browser SHOULD call `localhost:3000/api/admin-auth/login` because:
- This is the Next.js API route (proxy)
- It runs on your Next.js server
- It then forwards the request to orbashower.com

## 🔍 How to Diagnose the Actual Problem

### Step 1: Check Browser Console

Open browser DevTools (F12) → Console tab

Look for these logs:
```javascript
✅ Good:
"=== Login API Route Called ==="
"Forwarding login request to: https://orbashower.com/api/admin-auth/login"
"Backend response status: 200"
"Login successful"

❌ Bad:
"Backend response status: 401" → Wrong credentials
"Backend response status: 500" → Backend error
"Failed to fetch" → Network/CORS error
"Invalid response from server" → Backend not responding correctly
```

### Step 2: Check Terminal (where npm run dev is running)

Look for these logs:
```bash
✅ Good:
=== Login API Route Called ===
Request body: { "email": "...", "password": "..." }
Forwarding login request to: https://orbashower.com/api/admin-auth/login
Backend response status: 200
Backend response data: { success: true, token: "...", admin: {...} }

❌ Bad:
Failed to parse JSON response: ...
Login error: ...
Backend response status: 401
```

### Step 3: Check Network Tab

F12 → Network tab → Try login

Look at the request:
```
✅ Good Response:
POST /api/admin-auth/login
Status: 200 OK
Response: { success: true, admin: {...}, token: "..." }

❌ Bad Response:
Status: 401 Unauthorized → Wrong credentials
Status: 400 Bad Request → Missing email/password
Status: 500 Server Error → Backend problem
Status: 0 (failed) → Network/CORS issue
```

## Common Issues and Solutions

### Issue 1: "Invalid credentials" or 401 Error

**Problem:** Wrong email or password

**Solution:**
1. Check you're using the correct admin credentials
2. Create a new admin if needed:
```bash
curl -X POST https://orbashower.com/api/admin-auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123","name":"Admin"}'
```

### Issue 2: "Failed to fetch" or Network Error

**Problem:** Can't reach orbashower.com backend

**Solution:**
1. Check if backend is running:
```bash
curl https://orbashower.com/api/health
```

2. If it fails, the backend might be down
3. Check your internet connection

### Issue 3: CORS Error

**Problem:** Backend rejecting requests from localhost:3000

**Solution:**
Check backend's CORS configuration should include:
```javascript
allowedOrigins = [
  "http://localhost:3000",  // ← Must be here!
  "https://orbashower.com",
  // ...
]
```

### Issue 4: "Invalid response from server"

**Problem:** Backend not returning proper JSON

**Solution:**
1. Check backend logs
2. Verify the backend endpoint is correct
3. Test backend directly:
```bash
curl -X POST https://orbashower.com/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

## 🧪 Manual Test

### Test 1: Check Backend is Accessible

```bash
curl https://orbashower.com/api/health
```

**Expected:**
```json
{"status":"OK","message":"Showecabin API is running",...}
```

### Test 2: Test Login Directly on Backend

```bash
curl -X POST https://orbashower.com/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}'
```

**Expected (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "...",
  "admin": {
    "id": 1,
    "email": "YOUR_EMAIL",
    "name": "...",
    "role": "admin"
  }
}
```

**Expected (Failure):**
```json
{
  "error": "Invalid credentials"
}
```

### Test 3: Test via Browser Console

Open `http://localhost:3000/admin/login`, press F12, go to Console, paste:

```javascript
fetch('/api/admin-auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'YOUR_EMAIL',
    password: 'YOUR_PASSWORD'
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err))
```

## 📊 Checklist

Before asking for help, check:

- [ ] Dev server is running (`npm run dev`)
- [ ] No terminal errors shown
- [ ] Backend is accessible (test with curl)
- [ ] Using correct admin credentials
- [ ] Browser console shows the request being made
- [ ] Network tab shows the response status
- [ ] Read the actual error message in console

## 🆘 What to Report

If still not working, provide:

1. **Browser Console Logs** (all of them)
2. **Terminal Logs** (from npm run dev)
3. **Network Tab** (request/response details)
4. **Specific Error Message** you see
5. **Response Status Code** (200, 401, 500, etc.)

## 💡 Quick Debug

Run this in your browser console on the login page:

```javascript
console.log('Testing backend connection...');
fetch('https://orbashower.com/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend is reachable:', data))
  .catch(err => console.error('❌ Backend NOT reachable:', err));
```

If this fails, your backend is down or unreachable.

---

**Remember:** Seeing `http://localhost:3000/api/admin-auth/login` in the browser is CORRECT! 
That's the Next.js proxy that forwards to orbashower.com. ✅

