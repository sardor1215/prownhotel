@echo off
echo 🚀 Setting up Showecabin Ecommerce Project...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install

REM Create uploads directory
if not exist "uploads\products" mkdir uploads\products

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    copy env.example .env
    echo ⚠️  Please edit backend\.env with your database credentials
)

cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install

cd ..

echo.
echo 🎉 Installation completed!
echo.
echo 📋 Next steps:
echo 1. Set up PostgreSQL database:
echo    CREATE DATABASE showecabin_db;
echo.
echo 2. Configure backend environment:
echo    Edit backend\.env with your database credentials
echo.
echo 3. Run database setup:
echo    cd backend
echo    npm run db:migrate
echo    npm run db:seed
echo.
echo 4. Start the development servers:
echo    npm run dev
echo.
echo 🌐 Access the application:
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:5000
echo.
echo 👤 Default login credentials:
echo    Admin: admin@showecabin.com / admin123
echo    Customer: customer@example.com / customer123
echo.
pause 