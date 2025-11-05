# 🗄️ Manual Database Setup Guide

Since your database user doesn't have permission to create tables via scripts, follow these steps to set up the database manually.

## Step 1: Open Your Database Dashboard

1. Go to your database provider's dashboard (Neon, Heroku, Supabase, Railway, etc.)
2. Find the **SQL Editor** or **Query Tool**
3. Make sure you're connected to the correct database

## Step 2: Run the SQL Script

### Option A: Run All at Once (Recommended)

1. Open the file: `backend/scripts/create-hotel-tables.sql`
2. **Copy the entire contents** of the file
3. **Paste it into your database SQL Editor**
4. **Click "Run" or "Execute"**

### Option B: Run Step by Step (If Option A fails)

If you get errors, run each step separately:

1. **Step 1:** Open `backend/scripts/create-tables-step1.sql` - Create all tables
2. **Step 2:** Open `backend/scripts/create-tables-step2.sql` - Create indexes  
3. **Step 3:** Open `backend/scripts/create-tables-step3.sql` - Insert default data

The SQL file will:
- ✅ Create all necessary tables (admins, room_types, rooms, reservations, reservation_rooms)
- ✅ Create indexes for performance
- ✅ Insert default room types (Standard, Family, Premium, Superior)
- ✅ Insert sample rooms (8 rooms with images)

## Step 3: Verify Tables Were Created

After running the SQL, verify the tables exist by running:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admins', 'room_types', 'rooms', 'reservations', 'reservation_rooms');
```

You should see all 5 tables listed.

## Step 4: Create Admin Account

Once tables are created, run from your terminal:

```bash
cd backend
node scripts/setup-admin.js
```

This will create the default admin:
- **Email:** `admin@hotel.com`
- **Password:** `admin123`

## Step 5: Update Admin Password (Optional)

Change the default password:

```bash
node scripts/update-admin.js admin@hotel.com YourNewPassword123
```

## Alternative: Create Admin Manually via SQL

If the setup script also fails, you can create the admin manually:

```sql
-- First, hash the password using bcrypt
-- Default password: admin123
-- You can use an online bcrypt generator or Node.js

-- Example: If you have the hashed password, insert it:
INSERT INTO admins (email, password, name) 
VALUES (
  'admin@hotel.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYx5Yj5L8F2', -- This is a sample hash, generate your own
  'Hotel Administrator'
) 
ON CONFLICT (email) DO NOTHING;
```

To generate a bcrypt hash, you can:
1. Use an online tool: https://bcrypt-generator.com/
2. Use Node.js:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = await bcrypt.hash('your-password', 12);
   console.log(hash);
   ```

## Troubleshooting

### If SQL execution fails:

1. **Check error messages** - They'll tell you what went wrong
2. **Run tables one by one** - Create tables individually if bulk creation fails
3. **Check permissions** - Ensure you're using an account with CREATE TABLE permissions
4. **Verify syntax** - Some databases may need slight syntax adjustments

### Common Issues:

**"relation already exists"**
- This means tables already exist - you can skip those commands
- Or drop them first: `DROP TABLE IF EXISTS table_name CASCADE;`

**"permission denied"**
- You need to use a database admin account
- Contact your database provider for admin access
- Or use your database dashboard's built-in table creation tools

## What's Next?

After setting up the database:

1. ✅ Tables created
2. ✅ Admin account created
3. ✅ Start your backend server: `npm run dev` (in backend directory)
4. ✅ Start your frontend: `npm run dev` (in frontend directory)
5. ✅ Access admin panel: http://localhost:3000/admin/login

## Need Help?

If you're still having issues:
1. Check `DATABASE_SETUP_TROUBLESHOOTING.md` for more solutions
2. Contact your database provider's support
3. Verify your `DATABASE_URL` or connection credentials in `.env`

