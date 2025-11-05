# Showecabin Ecommerce Website

A complete ecommerce solution for shower cabins and bathroom accessories, built with Express.js backend and Next.js frontend.

## 🚀 Features

### Backend (Express.js + PostgreSQL)
- **Authentication & Authorization**: JWT-based auth with role-based access
- **Product Management**: CRUD operations with image uploads
- **Order Management**: Shopping cart, checkout, order tracking
- **User Management**: Customer profiles, wishlists, reviews
- **Admin Dashboard**: Analytics, order management, user management
- **File Upload**: Multer for product images
- **Security**: Helmet, CORS, rate limiting, input validation

### Frontend (Next.js + Tailwind CSS)
- **Modern UI**: Responsive design with Tailwind CSS
- **Product Catalog**: Search, filter, pagination
- **Shopping Cart**: Add/remove items, quantity management
- **User Dashboard**: Order history, profile management
- **Admin Panel**: Complete admin interface
- **Authentication**: Login/register with protected routes

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate limiting

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Data Fetching**: React Query

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd showecabin
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Database Setup

#### Create PostgreSQL database
```sql
CREATE DATABASE showecabin_db;
```

#### Configure environment variables
```bash
# Backend
cd backend
cp env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=showecabin_db
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=http://localhost:3000
```

### 4. Run database migrations and seed data
```bash
cd backend
npm run db:migrate
npm run db:seed
```

### 5. Start the development servers

#### Option 1: Run both servers simultaneously
```bash
# From root directory
npm run dev
```

#### Option 2: Run servers separately
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Access the application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 👤 Default Login Credentials

After running the seed script, you can use these credentials:

### Admin User
- **Email**: admin@showecabin.com
- **Password**: admin123

### Customer User
- **Email**: customer@example.com
- **Password**: customer123

## 📁 Project Structure

```
showecabin/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── users.js
│   │   └── admin.js
│   ├── scripts/
│   │   ├── migrate.js
│   │   └── seed.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── package.json
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/categories/all` - Get all categories

### Orders
- `GET /api/orders/cart` - Get user's cart
- `POST /api/orders/cart` - Add item to cart
- `PUT /api/orders/cart/:cartId` - Update cart item
- `DELETE /api/orders/cart/:cartId` - Remove from cart
- `POST /api/orders/checkout` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:orderId` - Get order details

### Admin
- `GET /api/admin/dashboard` - Dashboard analytics
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:orderId/status` - Update order status
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/role` - Update user role
- `GET /api/admin/products/stats` - Product statistics

## 🎨 Frontend Features

### Customer Features
- **Product Browsing**: Search, filter, and browse products
- **Shopping Cart**: Add items, manage quantities
- **User Account**: Profile management, order history
- **Wishlist**: Save favorite products
- **Reviews**: Rate and review purchased products

### Admin Features
- **Dashboard**: Sales analytics, recent orders, low stock alerts
- **Product Management**: Add, edit, delete products
- **Order Management**: View and update order statuses
- **User Management**: View customers, manage roles
- **Category Management**: Create and manage product categories

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: express-validator for data validation
- **CORS Protection**: Configured CORS for frontend-backend communication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Helmet**: Security headers for Express.js
- **File Upload Security**: File type and size validation

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Start the server with `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@showecabin.com or create an issue in the repository.

## 🔄 Updates

- **v1.0.0**: Initial release with basic ecommerce functionality
- Complete product catalog and shopping cart
- Admin dashboard with analytics
- User authentication and authorization
- Order management system 