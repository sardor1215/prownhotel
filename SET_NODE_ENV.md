# 🔧 Fix NODE_ENV Setting

## The Problem

If `NODE_ENV=production` is set while running your dev server locally, it causes issues with:
- ✅ Cookie `secure` flag (requires HTTPS in production)
- ✅ Cookie `sameSite` settings
- ✅ Other production-only behaviors

## The Solution

### For Local Development: Set `NODE_ENV=development`

---

## Option 1: Quick Fix - Start Dev Server Properly

Just restart your dev server normally. Next.js automatically sets `NODE_ENV=development`:

```bash
cd frontend
npm run dev
```

This automatically sets `NODE_ENV=development` ✅

---

## Option 2: Force Development Mode (If needed)

### Windows PowerShell:
```powershell
cd frontend
$env:NODE_ENV="development"
npm run dev
```

### Windows CMD:
```cmd
cd frontend
set NODE_ENV=development
npm run dev
```

### Mac/Linux:
```bash
cd frontend
NODE_ENV=development npm run dev
```

---

## Option 3: Create .env.local File

Create `frontend/.env.local`:

```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=https://orbashower.com
NEXTAUTH_URL=http://localhost:3000
```

Then restart:
```bash
cd frontend
npm run dev
```

---

## How to Verify

### Check in Browser Console (F12):

```javascript
console.log('NODE_ENV:', process.env.NODE_ENV);
// Should show: "development"
```

### Check in Terminal:
When you start the dev server, you should see:
```
 ▲ Next.js 14.x.x
 - Local:        http://localhost:3000
 - Environment:  development  ← Should say "development"
```

---

## Why This Matters

### When `NODE_ENV=production`:
```javascript
// Cookies require HTTPS (secure: true)
nextResponse.cookies.set('adminToken', token, {
  httpOnly: true,
  secure: true,  // ❌ Requires HTTPS! Won't work on http://localhost
  sameSite: 'lax',
  // ...
});
```

### When `NODE_ENV=development`:
```javascript
// Cookies work on HTTP (secure: false)
nextResponse.cookies.set('adminToken', token, {
  httpOnly: true,
  secure: false,  // ✅ Works on http://localhost
  sameSite: 'lax',
  // ...
});
```

---

## Check Your Current Setting

Run this in your terminal:

### Windows PowerShell:
```powershell
echo $env:NODE_ENV
```

### Windows CMD:
```cmd
echo %NODE_ENV%
```

### Mac/Linux:
```bash
echo $NODE_ENV
```

If it shows `production`, that's your problem! ❌

---

## The Fix

### Step 1: Stop Your Dev Server
Press `Ctrl+C` in the terminal

### Step 2: Clear the Environment Variable

**Windows PowerShell:**
```powershell
Remove-Item Env:\NODE_ENV
```

**Windows CMD:**
```cmd
set NODE_ENV=
```

**Mac/Linux:**
```bash
unset NODE_ENV
```

### Step 3: Restart Dev Server Normally
```bash
cd frontend
npm run dev
```

Now `NODE_ENV` will automatically be set to `development` by Next.js! ✅

---

## Verify It's Fixed

After restarting, check the terminal output:
```
 ▲ Next.js 14.x.x
 - Local:        http://localhost:3000
 - Environment:  development  ← Should say THIS!
```

And in browser console:
```javascript
console.log('NODE_ENV:', process.env.NODE_ENV);
// Should output: "development"
```

---

## Summary

✅ **For local development:** `NODE_ENV=development`  
❌ **Don't use:** `NODE_ENV=production` (for local dev)

✅ **Just run:** `npm run dev` (sets development automatically)  
✅ **Cookies will work** on http://localhost  
✅ **Login will work** properly  

---

## After Fixing

1. ✅ Stop server (Ctrl+C)
2. ✅ Clear NODE_ENV or just restart normally
3. ✅ Run `npm run dev`
4. ✅ Try login again
5. ✅ Should work now!

