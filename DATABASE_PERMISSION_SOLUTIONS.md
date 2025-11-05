# 🔒 Database Permission Solutions

If you're getting `permission denied for schema public` errors even when running SQL in your database dashboard, here are solutions:

## 🔍 Step 1: Check Your Permissions

Run this SQL in your database dashboard to check what permissions you have:

```sql
-- Check current user and permissions
SELECT current_user, session_user;
SELECT has_schema_privilege(current_user, 'public', 'CREATE') AS can_create_in_public;
```

If `can_create_in_public` returns `false`, you need to fix permissions.

## ✅ Solutions

### Solution 1: Use Admin/Superuser Account

Many managed databases provide separate admin credentials:

**Neon:**
- Go to Neon Console → Settings → Database Users
- Create or use a user with "Admin" role
- Use that connection string in your `.env`

**Supabase:**
- Go to Settings → Database
- Find the connection string with `service_role` key (not `anon` key)
- Use that for admin operations

**Heroku Postgres:**
- Use `heroku pg:psql` command which uses admin credentials
- Or get credentials from `heroku pg:credentials`

**Railway:**
- Check Settings → Database → Admin credentials
- Use admin connection string

### Solution 2: Request Permissions from Provider

If you're using a managed database:
1. Contact their support
2. Request CREATE TABLE permissions
3. Or upgrade to a plan that allows table creation

### Solution 3: Use Local PostgreSQL

If you have PostgreSQL installed locally:

1. **Install PostgreSQL** (if not installed):
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`

2. **Update your `.env` file:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=hotel_booking
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

3. **Create the database:**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE hotel_booking;
   
   # Exit
   \q
   ```

4. **Run the table creation script:**
   ```bash
   cd backend
   node scripts/create-hotel-tables.js
   ```

### Solution 4: Use Database Dashboard Tools

Some providers have GUI tools for creating tables:

**Neon:**
- Use Table Editor to create tables manually
- Or use Migration tool

**Supabase:**
- Use Table Editor to create tables
- Or use SQL Editor with service_role key

**Heroku:**
- Use `heroku pg:psql` command
- Or use Data Studio

### Solution 5: Grant Permissions (If you have admin access)

If you have a superuser/admin account, run this:

```sql
-- Grant permissions to your user
GRANT ALL ON SCHEMA public TO your_username;
GRANT CREATE ON SCHEMA public TO your_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_username;
```

## 🎯 Recommended Approach

**For Managed Databases (Neon, Supabase, Heroku, etc.):**

1. **Find Admin Credentials:**
   - Check your provider's dashboard
   - Look for "Admin", "Superuser", or "Service Role" credentials
   - Update your `.env` with admin connection string

2. **Use Provider's Migration Tool:**
   - Many providers have migration tools
   - Use their GUI to create tables
   - Or use their CLI tools

3. **Contact Support:**
   - If you can't find admin credentials
   - Request CREATE TABLE permissions
   - Or ask them to create the tables for you

**For Local Development:**

1. Install PostgreSQL locally
2. Use local database
3. Run scripts directly

## 📋 Quick Checklist

- [ ] Check if you're using admin/superuser account
- [ ] Verify your connection string has correct credentials
- [ ] Check if your database plan allows table creation
- [ ] Try using provider's migration tool or GUI
- [ ] Consider using local PostgreSQL for development
- [ ] Contact database provider support if needed

## 🔗 Database Provider Links

- **Neon:** https://neon.tech/docs
- **Supabase:** https://supabase.com/docs
- **Heroku:** https://devcenter.heroku.com/articles/heroku-postgresql
- **Railway:** https://docs.railway.app/databases/postgresql

## 💡 Alternative: Use Local PostgreSQL

If you're having persistent permission issues, the easiest solution is to use a local PostgreSQL database for development:

1. Install PostgreSQL
2. Create a database
3. Update `.env` with local credentials
4. Run the scripts - they should work without permission issues


