# Admin Panel Testing Guide

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd backend
npm run dev
```
The backend should start on `http://localhost:5000`

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
The frontend should start on `http://localhost:3000`

### 3. Setup Database (if needed)
```bash
cd backend

# Create tables
node scripts/create-hotel-tables.js

# Setup admin user
node scripts/setup-admin.js
```

### 4. Test Admin Login
```bash
cd backend
node scripts/test-admin-login.js
```

This will verify your admin credentials are working.

---

## 🔐 Login

**URL**: http://localhost:3000/admin/login

**Default Credentials**:
- Email: `admin@hotel.com`
- Password: `admin123`

**What to Check**:
- [ ] Elegant login page with dark background
- [ ] Gold/amber accent colors
- [ ] Show/hide password toggle works
- [ ] Login redirects to dashboard
- [ ] Error messages display properly

---

## 📊 Dashboard

**URL**: http://localhost:3000/admin/dashboard

**Features to Test**:
- [ ] See total rooms count
- [ ] View pending bookings
- [ ] Check confirmed reservations
- [ ] Monitor monthly revenue
- [ ] Today's check-ins/check-outs banner
- [ ] Recent reservations list
- [ ] Occupancy rate progress bar
- [ ] Revenue summary cards
- [ ] Booking status breakdown
- [ ] Quick action buttons work

---

## 🏨 Rooms Management

**URL**: http://localhost:3000/admin/rooms

**Features to Test**:

### Stats Bar
- [ ] Total rooms count displayed
- [ ] Available rooms count
- [ ] Unavailable rooms count

### Search & Filter
- [ ] Search by room name works
- [ ] Search by room type works
- [ ] Filter by availability (all/available/unavailable)

### Room Cards
- [ ] Room image displays (or placeholder)
- [ ] Status badge shows correctly (green/red)
- [ ] Room details are complete
- [ ] Price displays correctly

### Actions
- [ ] Click "Edit" button (should navigate to edit page)
- [ ] Toggle availability (Enable/Disable)
- [ ] Delete room (with confirmation)
- [ ] "Add New Room" button appears

### Empty State
- [ ] Shows message when no rooms found
- [ ] Displays when filters don't match

---

## 📅 Reservations

**URL**: http://localhost:3000/admin/reservations

**Features to Test**:

### Status Tabs
- [ ] All Reservations tab
- [ ] Pending tab (with count)
- [ ] Confirmed tab (with count)
- [ ] Completed tab (with count)
- [ ] Cancelled tab (with count)
- [ ] Counts update correctly

### Search & Sort
- [ ] Search by guest name
- [ ] Search by email
- [ ] Search by phone
- [ ] Sort: Newest first
- [ ] Sort: Oldest first
- [ ] Sort: By check-in date
- [ ] Sort: By amount (high/low)

### Reservation Cards
- [ ] Guest information displays
- [ ] Status badge shows correct color
- [ ] Booking dates are correct
- [ ] Guest count displays
- [ ] Total amount highlighted
- [ ] Special requests appear (if any)
- [ ] Booking timestamp shows

### Status Actions
**For Pending Reservations**:
- [ ] "Confirm" button appears
- [ ] "Cancel" button appears
- [ ] Confirmation updates status
- [ ] Cancellation updates status

**For Confirmed Reservations**:
- [ ] "Complete" button appears
- [ ] "Cancel" button appears
- [ ] Actions work correctly

### View Details
- [ ] Click "View Details" button
- [ ] Navigate to reservation detail page

---

## 🛏️ Room Types

**URL**: http://localhost:3000/admin/room-types

**Features to Test**:

### Add New Room Type
- [ ] Click "Add Room Type" button
- [ ] Form appears inline
- [ ] Enter room type name
- [ ] Set max adults
- [ ] Set max children
- [ ] Total capacity calculates automatically
- [ ] Add description
- [ ] Click "Create Room Type"
- [ ] Success message appears
- [ ] New card appears in list

### Edit Room Type
- [ ] Click "Edit" on any room type
- [ ] Form populates with existing data
- [ ] Make changes
- [ ] Click "Update Room Type"
- [ ] Success message appears
- [ ] Changes reflect in card

### Delete Room Type
- [ ] Click delete (trash icon)
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Room type removed from list

### Cancel
- [ ] Click "Cancel" in form
- [ ] Form closes
- [ ] No changes saved

### Room Type Cards
- [ ] Name displays in serif font
- [ ] Slug shows correctly
- [ ] Description appears (if provided)
- [ ] Max adults shows in box
- [ ] Max children shows in box
- [ ] Total capacity highlighted
- [ ] Created date displays

---

## 📈 Analytics

**URL**: http://localhost:3000/admin/analytics

**What to Check**:
- [ ] "Coming Soon" message displays
- [ ] Feature preview cards show:
  - Revenue Reports
  - Booking Analysis
  - Guest Insights
  - Performance
- [ ] Professional design matches theme

---

## ⚙️ Settings

**URL**: http://localhost:3000/admin/settings

**What to Check**:
- [ ] "Coming Soon" message displays
- [ ] Feature preview cards show:
  - Profile Settings
  - Security
  - Notifications
  - Preferences
  - Privacy
  - Advanced
- [ ] Professional design matches theme

---

## 🎨 Design Checklist

### Overall Appearance
- [ ] Black sidebar with gold accents
- [ ] White content area with grey borders
- [ ] Serif fonts for headings
- [ ] Consistent spacing and padding
- [ ] Rounded corners on cards
- [ ] Subtle shadows
- [ ] Smooth transitions

### Colors
- [ ] Amber/gold for primary actions
- [ ] Green for success/available
- [ ] Red for errors/unavailable
- [ ] Blue for info/completed
- [ ] Amber for warnings/pending

### Navigation
- [ ] Sidebar shows all menu items
- [ ] Active page highlighted in gold
- [ ] Icons display correctly
- [ ] Hover effects work
- [ ] Mobile menu works (hamburger)

### Responsive Design
- [ ] Works on mobile (< 768px)
- [ ] Works on tablet (768-1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Sidebar collapses on mobile
- [ ] Grids adjust to screen size

---

## 🔄 Logout

**Test Logout**:
- [ ] Click user section in sidebar
- [ ] Click "Sign out"
- [ ] Redirects to login page
- [ ] Cannot access admin pages without login

---

## 📱 Mobile Testing

### Open on Mobile Device
1. Find your computer's local IP:
   ```bash
   # On Mac/Linux
   ifconfig | grep "inet "
   
   # On Windows
   ipconfig
   ```

2. Access from mobile:
   ```
   http://YOUR_IP:3000/admin/login
   ```

### Mobile Checklist
- [ ] Login page looks good
- [ ] Sidebar becomes hamburger menu
- [ ] Menu slides in from left
- [ ] Cards stack vertically
- [ ] Forms are easy to fill
- [ ] Buttons are tap-friendly
- [ ] Text is readable

---

## 🐛 Common Issues & Solutions

### Cannot Login
```bash
# Reset admin password
cd backend
node scripts/test-admin-login.js
```

### Database Connection Error
```bash
# Check .env file in backend folder
# Verify DATABASE_URL or individual DB variables
```

### Frontend Not Loading
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

### Backend API Errors
```bash
# Check backend console for errors
# Verify all tables exist in database
cd backend
node scripts/create-hotel-tables.js
```

### Cannot See Rooms/Reservations
- Make sure backend is running on port 5000
- Check browser console for API errors
- Verify admin token is stored (check localStorage)

---

## ✅ Expected Results

After testing, you should have:

1. **Functional Admin Panel**
   - All pages load correctly
   - Navigation works smoothly
   - Data displays properly

2. **CRUD Operations**
   - Can create rooms, room types
   - Can read/view all data
   - Can update reservation statuses
   - Can delete items with confirmation

3. **Professional Design**
   - Elegant black/gold theme
   - Consistent styling
   - Smooth animations
   - Responsive layout

4. **User Experience**
   - Intuitive navigation
   - Clear feedback messages
   - Loading states
   - Empty states with helpful messages

---

## 📞 Need Help?

If something doesn't work:
1. Check browser console for errors (F12)
2. Check backend terminal for error messages
3. Verify database connection
4. Run the test-admin-login script
5. Clear browser cache and cookies
6. Restart both frontend and backend

---

## 🎉 Success!

Once all items are checked, your admin panel is fully functional and ready to use for managing Cezar's Airport Hotel!

**Happy Testing! 🏨✨**


