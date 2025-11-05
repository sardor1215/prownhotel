# Cezar's Airport Hotel - Booking System

A complete hotel booking and management system built with Next.js, Express.js, and PostgreSQL.

## 🏨 Features

### Guest Features
- **Room Browsing**: View available rooms with photos, amenities, and pricing
- **Advanced Search**: Filter rooms by check-in/check-out dates, guests, and room type
- **Online Booking**: Complete reservation system with date picker
- **Reservation Confirmation**: Instant booking confirmation with details
- **Contact Information**: Easy access to hotel contact details and location

### Admin Features
- **Room Management**: Add, edit, and delete rooms
- **Reservation Management**: View and manage all guest bookings
- **Room Types**: Manage different room categories
- **Dashboard**: Overview of bookings and room availability
- **Analytics**: Track reservations and occupancy

### Room Types
1. **Standard Room** - Comfortable rooms with essential amenities (3 adults, 1 child)
2. **Family Room** - Spacious suites perfect for families (4 adults, 2 children)
3. **Premium Room** - Enhanced rooms with extra amenities (3 adults, 2 children)
4. **Superior Room** - Luxury rooms with premium features (2 adults, 1 child)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd uzuninsaat
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure Database**

Create a PostgreSQL database and update the connection settings in `backend/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_booking
DB_USER=your_username
DB_PASSWORD=your_password

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (for admin authentication)
JWT_SECRET=your_secret_key_here
```

4. **Initialize Database**

Run the database migration to create tables and seed initial data:

```bash
cd backend
node scripts/create-hotel-tables.js
```

This will create:
- Room types (Standard, Family, Premium, Superior)
- Sample rooms with images from `/imgtouse` folder
- Admin authentication tables
- Reservation tables

5. **Create Admin User**

You'll need to create an admin user in the database manually or use the admin registration endpoint:

```sql
-- Insert admin user (password should be hashed in production)
INSERT INTO admins (email, password, name) 
VALUES ('admin@hotel.com', 'hashed_password', 'Admin User');
```

6. **Start the Application**

```bash
# From project root, run both frontend and backend
npm run dev

# Or run them separately:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
uzuninsaat/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── middleware/
│   │   ├── admin-auth.js        # Admin authentication
│   │   └── auth.js              # User authentication
│   ├── routes/
│   │   ├── rooms.js             # Room routes
│   │   ├── reservations.js      # Reservation routes
│   │   ├── admin-rooms.js       # Admin room management
│   │   └── admin-auth.js        # Admin authentication
│   ├── scripts/
│   │   └── create-hotel-tables.js  # Database setup
│   └── server.js                # Express server
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Homepage
│   │   ├── rooms/
│   │   │   ├── page.tsx         # Rooms listing
│   │   │   └── [id]/
│   │   │       └── book/        # Booking page
│   │   ├── reservations/
│   │   │   └── [id]/            # Reservation confirmation
│   │   ├── admin/
│   │   │   ├── dashboard/       # Admin dashboard
│   │   │   ├── rooms/           # Room management
│   │   │   └── login/           # Admin login
│   │   └── globals.css          # Global styles
│   └── public/
│       └── imgtouse/            # Hotel images
│
└── package.json
```

## 🎨 Design Features

- **Modern UI**: Clean, professional design matching luxury hotel aesthetics
- **Responsive**: Fully responsive design works on all devices
- **Blue & Gold Theme**: Professional color scheme with royal blue and gold accents
- **Hero Section**: Stunning hero with integrated booking form
- **Image Gallery**: Showcase hotel rooms with high-quality images
- **Contact Section**: Integrated Google Maps and contact information

## 🔧 API Endpoints

### Public Endpoints

**Rooms**
- `GET /api/rooms` - Get all available rooms (with filters)
- `GET /api/rooms/:id` - Get single room details
- `GET /api/rooms/:id/availability` - Check room availability

**Reservations**
- `POST /api/reservations` - Create new reservation
- `GET /api/reservations/:id` - Get reservation details

### Admin Endpoints (Requires Authentication)

**Room Management**
- `GET /api/admin/rooms` - Get all rooms
- `POST /api/admin/rooms` - Create new room
- `PUT /api/admin/rooms/:id` - Update room
- `DELETE /api/admin/rooms/:id` - Delete room

**Room Types**
- `GET /api/admin/rooms/types` - Get all room types
- `POST /api/admin/rooms/types` - Create room type
- `PUT /api/admin/rooms/types/:id` - Update room type
- `DELETE /api/admin/rooms/types/:id` - Delete room type

**Reservations**
- `GET /api/reservations` - Get all reservations
- `PATCH /api/reservations/:id/status` - Update reservation status

## 📸 Using Images

The system uses images from the `/imgtouse` folder. Place your hotel images there and reference them in the database:

```javascript
main_image: '/imgtouse/IMGM8778.JPG'
```

Supported formats:
- JPG/JPEG
- PNG
- WebP

## 🔐 Security

- Admin routes are protected with JWT authentication
- Passwords should be hashed using bcrypt
- CORS configured for security
- Rate limiting enabled
- Input validation on all forms

## 📱 Features to Add (Optional)

- Email notifications for bookings
- Payment integration (Stripe, PayPal)
- Multi-language support
- Review system
- Photo gallery for each room
- Loyalty program
- Discount codes
- Season-based pricing

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### Port Already in Use
- Change port in backend `.env` (default: 5000)
- Change port in frontend (default: 3000)

### Images Not Loading
- Ensure images are in `/frontend/public/imgtouse/`
- Check file permissions
- Verify image paths in database

## 📞 Support

For issues or questions:
- Email: info@cezarsairporthotel.com
- Phone: +90 533 837 24 57

## 📄 License

This project is licensed under the MIT License.

## 🙏 Credits

Built with:
- **Next.js 14** - React framework
- **Express.js** - Backend framework
- **PostgreSQL** - Database
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

---

**Cezar's Airport Hotel** - Experience luxury and comfort


