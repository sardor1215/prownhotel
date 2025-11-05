# 🔧 Database Setup Troubleshooting

## Permission Denied Error

If you're getting `permission denied for schema public` error, this usually means your database user doesn't have permission to create tables.

### Solutions:

#### Option 1: Fix Permissions Script

Try running the permission fix script:

```bash
cd backend
node scripts/fix-schema-permissions.js
```

This will attempt to grant the necessary permissions (may not work on managed databases).

#### Option 2: Use Database Dashboard

If you're using a managed database (Neon, Heroku, Supabase, etc.):

1. **Go to your database dashboard**
2. **Open SQL Editor / Query Tool**
3. **Run the table creation SQL manually**

Copy the SQL from `backend/scripts/create-hotel-tables.js` and run it in your database dashboard.

#### Option 3: Grant Permissions Manually

If you have database admin access, run these SQL commands:

```sql
-- Grant permissions on public schema
GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT CREATE ON SCHEMA public TO PUBLIC;
GRANT USAGE ON SCHEMA public TO PUBLIC;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO PUBLIC;
```

#### Option 4: Use a Different Database User

If you're using a managed database:
- Check if there's a superuser/admin account you can use
- Some providers have separate admin credentials
- Contact support to enable table creation permissions

#### Option 5: Create Tables via Database Provider

Many managed databases have:
- **Database Dashboards** where you can create tables
- **Migration Tools** that handle permissions automatically
- **SQL Editors** where you can run the CREATE TABLE statements

### Manual Table Creation

If all else fails, you can create the tables manually. Here's the SQL:

```sql
-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create room_types table
CREATE TABLE IF NOT EXISTS room_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  max_adults INTEGER NOT NULL DEFAULT 2,
  max_children INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_per_night DECIMAL(10,2) NOT NULL,
  room_type_id INTEGER REFERENCES room_types(id) ON DELETE SET NULL,
  main_image VARCHAR(500),
  images TEXT[],
  max_adults INTEGER NOT NULL DEFAULT 2,
  max_children INTEGER NOT NULL DEFAULT 0,
  size_sqm INTEGER,
  amenities JSONB,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50) NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  special_requests TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create reservation_rooms table
CREATE TABLE IF NOT EXISTS reservation_rooms (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
  room_id INTEGER REFERENCES rooms(id),
  room_name VARCHAR(255) NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  nights INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rooms_is_available ON rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(guest_email);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date);
```

### Common Database Providers

#### Neon PostgreSQL
- Go to Neon Console → SQL Editor
- Run the CREATE TABLE statements manually
- Or use Neon's migration tool

#### Heroku Postgres
- Use `heroku pg:psql` command
- Or use Heroku Data Studio

#### Supabase
- Go to Supabase Dashboard → SQL Editor
- Run the CREATE TABLE statements

#### Railway
- Use Railway's database dashboard
- Or connect via `psql` with admin credentials

### After Creating Tables

Once tables are created, you can:

1. **Create admin account:**
   ```bash
   node scripts/setup-admin.js
   ```

2. **Update admin password:**
   ```bash
   node scripts/update-admin.js admin@hotel.com your-password
   ```

### Need Help?

If you're still having issues:
1. Check your database provider's documentation
2. Verify your DATABASE_URL or connection credentials
3. Ensure your database plan supports table creation
4. Contact your database provider's support


