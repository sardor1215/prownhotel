# Quick Start Guide - Cezar's Airport Hotel

## 🚀 Fast Setup (5 minutes)

### Step 1: Install Dependencies
```bash
# Install all dependencies at once
npm run install:all
```

### Step 2: Configure Database

1. Create a PostgreSQL database named `hotel_booking`

2. Create `backend/.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_booking
DB_USER=postgres
DB_PASSWORD=your_password

PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_change_this_in_production
```

### Step 3: Setup Database Tables
```bash
cd backend
node scripts/create-hotel-tables.js
```

This creates:
- ✅ 4 room types (Standard, Family, Premium, Superior)
- ✅ 8 sample rooms with images
- ✅ All necessary tables (rooms, reservations, room_types, admins)

### Step 4: Create Admin User
```bash
cd backend
npm install bcrypt
node scripts/setup-admin.js
```

Default admin credentials:
- **Email**: admin@hotel.com
- **Password**: admin123

⚠️ **Change this password after first login!**

### Step 5: Start the Application
```bash
# From project root
npm run dev
```

This starts both:
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:5000

## 🎯 What You Can Do Now

### As a Guest (Frontend)
1. **Browse Rooms**: Go to http://localhost:3000
2. **Search Available Rooms**: Use the date picker on homepage
3. **Make a Reservation**: Click on any room and fill booking form
4. **View Confirmation**: Get instant booking confirmation

### As an Admin
1. **Login**: Go to http://localhost:3000/admin/login
   - Email: admin@hotel.com
   - Password: admin123

2. **Manage Rooms**: http://localhost:3000/admin/rooms
   - Add new rooms
   - Edit existing rooms
   - Delete rooms
   - Toggle availability

3. **View Reservations**: http://localhost:3000/admin/reservations
   - See all bookings
   - Update reservation status
   - Manage guest information

## 📁 Using Your Own Images

1. **Place images** in `frontend/public/imgtouse/` folder
2. **Reference them** in admin panel when creating/editing rooms:
   ```
   /imgtouse/your-image.jpg
   ```

Current sample images are already in that folder!

## 🔧 Common Commands

```bash
# Start development (both frontend & backend)
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Create production build
npm run build

# Start production server
npm start
```

## 📊 Database Structure

The system creates these tables:
- `room_types` - Room categories (Standard, Family, Premium, Superior)
- `rooms` - Individual room listings
- `reservations` - Guest bookings
- `reservation_rooms` - Links reservations to rooms
- `admins` - Admin user accounts

## 🎨 Customization

### Change Hotel Name
1. Edit `frontend/app/page.tsx` - Update header and footer
2. Update `HOTEL_BOOKING_SYSTEM.md` - Change documentation

### Change Colors
1. Edit `frontend/app/globals.css` - Modify CSS variables
2. Primary color: `--color-primary`
3. Secondary color: `--color-secondary`

### Change Room Types
1. Go to admin panel
2. Navigate to Room Types
3. Add/Edit/Delete types

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Verify database exists
psql -U postgres -c "\l"

# Create database if needed
psql -U postgres -c "CREATE DATABASE hotel_booking;"
```

### Port Already in Use
```bash
# Change backend port in backend/.env
PORT=5001

# Change frontend port
cd frontend
npm run dev -- -p 3001
```

### Images Not Showing
- Verify images are in `frontend/public/imgtouse/`
- Check image paths start with `/imgtouse/`
- Ensure backend server is running (serves static files)

## 📞 Need Help?

Check the full documentation in `HOTEL_BOOKING_SYSTEM.md`

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Database created
- [ ] `.env` file configured
- [ ] Tables created with sample data
- [ ] Admin user created
- [ ] Both servers running
- [ ] Can access homepage at http://localhost:3000
- [ ] Can login to admin at http://localhost:3000/admin/login

## 🎉 You're Ready!

Your hotel booking system is now fully operational!

**Next Steps:**
1. Change admin password
2. Add your hotel's images
3. Create your real rooms
4. Customize the design
5. Deploy to production

Enjoy your new hotel booking system! 🏨


