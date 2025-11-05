# 🚨 QUICK FIX - Login 400 Error

## The Problem
Your frontend can't reach your backend because it's looking in the wrong place!

- ❌ Currently trying: `http://localhost:5000` (doesn't exist)
- ✅ Should use: `https://orbashower.com` (your actual backend)

## The 3-Step Fix

### 1️⃣ Create the Environment File

Open PowerShell in your `frontend` folder and run:

```powershell
cd frontend

# Create the file
@"
NEXT_PUBLIC_API_URL=https://orbashower.com
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
"@ | Out-File -FilePath ".env.local" -Encoding utf8
```

**OR** manually create `frontend/.env.local` with this content:
```
NEXT_PUBLIC_API_URL=https://orbashower.com
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 2️⃣ Restart the Dev Server

Stop your current server (Ctrl+C) and restart:

```bash
cd frontend
npm run dev
```

### 3️⃣ Test the Login

1. Go to: `http://localhost:3000/admin/login`
2. Press F12 → Console tab
3. Try logging in
4. Look for: `usingApiUrl: 'https://orbashower.com/api/admin-auth/login'`

## ✅ How to Know It's Fixed

**Before (wrong):**
```
Forwarding login request to: http://localhost:5000/api/admin-auth/login
❌ Error: Failed to fetch
```

**After (correct):**
```
Forwarding login request to: https://orbashower.com/api/admin-auth/login
✅ Backend response status: 200
```

## ⚡ Still Not Working?

### Check 1: Is the backend running?
```bash
curl https://orbashower.com/api/health
```
Should return: `{"status":"OK",...}`

### Check 2: Did you restart the dev server?
The `.env.local` file is only read when the server starts!

### Check 3: Is CORS configured?
The backend needs to allow requests from `http://localhost:3000`

## 📝 Files Changed

I've already updated:
- ✅ `frontend/public/env-config.js` → Now points to `https://orbashower.com`
- ✅ All API routes → Now properly handle URL construction

You need to create:
- ⚠️ `frontend/.env.local` → Override with production backend URL

---

**Need Help?** Check `ENVIRONMENT_SETUP.md` for detailed instructions!

