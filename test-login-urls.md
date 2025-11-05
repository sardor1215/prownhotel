# Test Login URLs

## Quick Test Commands

### 1. Check if Backend is Running
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Showecabin API is running",
  "timestamp": "...",
  "environment": "development"
}
```

### 2. Test Backend Admin Login Endpoint Directly
```bash
curl -X POST http://localhost:5000/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-admin-email@example.com","password":"yourpassword"}'
```

Expected response (on success):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "...",
  "admin": {
    "id": 1,
    "email": "your-admin-email@example.com",
    "name": "Admin Name",
    "role": "admin"
  }
}
```

### 3. Test Frontend API Route (through Next.js)
Open your browser and:
1. Go to `http://localhost:3000/admin/login`
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Try logging in

Look for these console logs:
- `=== Login API Route Called ===`
- `Environment: { NODE_ENV: '...', NEXT_PUBLIC_API_URL: '...', usingApiUrl: '...' }`
- `Forwarding login request to: http://localhost:5000/api/admin-auth/login`

## Common Issues and Solutions

### Issue: "Failed to fetch" or Connection Refused
**Cause**: Backend is not running
**Solution**: 
```bash
cd backend
npm start
```

### Issue: "CORS error"
**Cause**: Frontend and backend origins not matching
**Solution**: Check that backend `server.js` includes your frontend URL in CORS allowed origins

### Issue: "Invalid credentials"
**Cause**: Wrong email or password
**Solution**: 
1. Make sure you have created an admin account
2. Use the correct credentials
3. Or create a new admin:
```bash
curl -X POST http://localhost:5000/api/admin-auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123","name":"Admin User"}'
```

### Issue: URL shows "http://localhost:5000/api/api/..."
**Cause**: This was the original bug - now fixed!
**Solution**: Update has been applied. If you still see this, restart your dev server:
```bash
# Stop the frontend dev server (Ctrl+C)
cd frontend
npm run dev
```

## URL Patterns to Verify

✅ **Correct URLs**:
- `http://localhost:5000/api/admin-auth/login`
- `http://localhost:5000/api/admin-auth/verify`
- `http://localhost:5000/api/admin-auth/logout`
- `http://localhost:5000/api/admin/analytics/...`
- `http://localhost:5000/api/admin/products`

❌ **Incorrect URLs** (should NOT see these):
- `http://localhost:5000/api/api/admin-auth/login` (double /api/)
- `http://localhost:5000//api/admin-auth/login` (double slashes)
- `http://localhost:5000admin-auth/login` (missing /api/)

## Browser Console Commands for Testing

Open browser console on `http://localhost:3000/admin/login` and run:

```javascript
// Test login
fetch('/api/admin-auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err))
```

```javascript
// Test verify (after login)
fetch('/api/admin-auth/verify')
.then(r => r.json())
.then(data => console.log('Verify Response:', data))
.catch(err => console.error('Error:', err))
```

