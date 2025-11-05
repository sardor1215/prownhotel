#!/bin/bash

echo "🚀 Setting up Showecabin Ecommerce Project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Create uploads directory
mkdir -p uploads/products

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env with your database credentials"
fi

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

cd ..

echo ""
echo "🎉 Installation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set up PostgreSQL database:"
echo "   CREATE DATABASE showecabin_db;"
echo ""
echo "2. Configure backend environment:"
echo "   Edit backend/.env with your database credentials"
echo ""
echo "3. Run database setup:"
echo "   cd backend"
echo "   npm run db:migrate"
echo "   npm run db:seed"
echo ""
echo "4. Start the development servers:"
echo "   npm run dev"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000"
echo ""
echo "👤 Default login credentials:"
echo "   Admin: admin@showecabin.com / admin123"
echo "   Customer: customer@example.com / customer123" 