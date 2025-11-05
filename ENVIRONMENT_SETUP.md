# Environment Setup Guide

## Problem Summary
You're getting a **400 Bad Request** when trying to login because the frontend doesn't know where your backend API is located.

## Current Situation
- Your backend is hosted at: `https://orbashower.com`
- Your frontend is running locally at: `http://localhost:3000`
- The frontend is currently configured to look for backend at: `http://localhost:5000` (which doesn't exist)

## Solution: Configure Environment Variables

### Step 1: Create `.env.local` File

In your `frontend` directory, create a new file named `.env.local` with this content:

```env
# Backend API URL - Points to your production backend
NEXT_PUBLIC_API_URL=https://orbashower.com

# NextAuth URL (for authentication)
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Step 2: Restart Your Dev Server

After creating the `.env.local` file, you **MUST** restart your Next.js development server:

```bash
# Press Ctrl+C to stop the current server
# Then restart it:
cd frontend
npm run dev
```

### Step 3: Verify the Configuration

After restarting:

1. Open your browser to `http://localhost:3000/admin/login`
2. Open Developer Tools (F12) → Console tab
3. Try to login
4. Look for this log message:
   ```
   Environment: {
     NODE_ENV: 'development',
     NEXT_PUBLIC_API_URL: 'https://orbashower.com',
     usingApiUrl: 'https://orbashower.com/api/admin-auth/login'
   }
   ```

## Alternative Configurations

### Option A: Local Backend (if you have backend running locally)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Option B: Production Backend (your current case)
```env
NEXT_PUBLIC_API_URL=https://orbashower.com
```

### Option C: Custom Backend URL
```env
NEXT_PUBLIC_API_URL=http://192.168.0.109:5000
```

## Complete `.env.local` File Content

Create `frontend/.env.local` with exactly this content:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=https://orbashower.com

# Frontend URL
NEXTAUTH_URL=http://localhost:3000

# Environment Mode
NODE_ENV=development
```

## How to Create the File

### Windows (PowerShell):
```powershell
cd frontend
New-Item -Path ".env.local" -ItemType File -Force
notepad .env.local
# Paste the content above and save
```

### Windows (Command Prompt):
```cmd
cd frontend
echo # Backend API Configuration > .env.local
echo NEXT_PUBLIC_API_URL=https://orbashower.com >> .env.local
echo. >> .env.local
echo # Frontend URL >> .env.local
echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
echo. >> .env.local
echo # Environment Mode >> .env.local
echo NODE_ENV=development >> .env.local
```

### Mac/Linux:
```bash
cd frontend
cat > .env.local << 'EOF'
# Backend API Configuration
NEXT_PUBLIC_API_URL=https://orbashower.com

# Frontend URL
NEXTAUTH_URL=http://localhost:3000

# Environment Mode
NODE_ENV=development
EOF
```

## Troubleshooting

### Issue: Still getting 400 Bad Request after creating .env.local

**Solution 1: Verify the file was created correctly**
```bash
cd frontend
cat .env.local  # Mac/Linux
type .env.local  # Windows
```

**Solution 2: Force restart the dev server**
```bash
# Stop the server (Ctrl+C)
# Delete the .next cache
rm -rf .next  # Mac/Linux
rmdir /s /q .next  # Windows

# Start fresh
npm run dev
```

**Solution 3: Check browser console**
Open `http://localhost:3000/admin/login`, press F12, and check:
1. Console tab - Look for the "Environment:" log
2. Network tab - Look for the request to `/api/admin-auth/login` and see what error it shows

### Issue: CORS Error

If you see a CORS error, it means the backend at `https://orbashower.com` needs to allow requests from `http://localhost:3000`.

Check the backend's `server.js` file and ensure it has this in the allowed origins:
```javascript
const allowedOrigins = [
  "http://localhost:3000",
  "https://orbashower.com",
  // ... other origins
];
```

### Issue: SSL Certificate Error

If you get an SSL error when connecting to `https://orbashower.com`, the backend might have certificate issues.

**Temporary workaround (development only):**
```bash
# On Windows
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
npm run dev

# On Mac/Linux
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

⚠️ **Warning**: Never use `NODE_TLS_REJECT_UNAUTHORIZED=0` in production!

## Expected Behavior After Fix

✅ Login page loads at `http://localhost:3000/admin/login`
✅ Browser console shows: `usingApiUrl: 'https://orbashower.com/api/admin-auth/login'`
✅ Network tab shows successful request to backend
✅ Login succeeds and redirects to admin dashboard

## Quick Test Command

After setting up `.env.local`, test if the backend is reachable:

```bash
# Test if backend is accessible
curl https://orbashower.com/api/health

# Expected response:
# {"status":"OK","message":"Showecabin API is running",...}
```

If this fails, your backend might be down or not accessible from your location.

