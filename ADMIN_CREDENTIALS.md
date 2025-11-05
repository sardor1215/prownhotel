# 🔐 Admin Credentials Management

This guide explains how to change admin email address and password for Cezar's Airport Hotel admin panel.

## 📋 Methods to Update Admin Credentials

### Method 1: Using the Update Admin Script (Recommended)

The easiest way to update admin email and password is using the provided script:

```bash
cd backend
node scripts/update-admin.js
```

This script will:
1. List all existing admin accounts
2. Let you select which admin to update
3. Allow you to update email, password, or both

**Example:**
```bash
$ node scripts/update-admin.js

🔐 Admin Account Management
================================

📋 Current Admin Accounts:
================================
1. ID: 1
   Email: admin@hotel.com
   Name: Hotel Administrator
   Created: 2024-01-15 10:30:00

================================

Select admin account number to update: 1

Selected: admin@hotel.com

What would you like to update?
1. Email address
2. Password
3. Both email and password
4. Cancel

Enter your choice (1-4): 2
Enter new password (min 6 characters): ********
✅ Password updated successfully!
   Admin email: admin@hotel.com
   ⚠️  New password is now active. Please use it for login.
```

### Method 2: Using SQL Directly

You can also update admin credentials directly in the database:

#### Update Email:
```sql
UPDATE admins 
SET email = 'new-email@example.com', updated_at = NOW() 
WHERE email = 'old-email@example.com';
```

#### Update Password:
```sql
-- First, you need to hash the password using bcrypt
-- Use a tool like https://bcrypt-generator.com/ or Node.js:

-- In Node.js:
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('your-new-password', 12);

-- Then update:
UPDATE admins 
SET password = '$2a$12$...your-hashed-password...', updated_at = NOW() 
WHERE email = 'admin@hotel.com';
```

### Method 3: Using the Setup Script (Reset to Default)

If you want to reset the password to the default (`admin123`):

```bash
cd backend
node scripts/setup-admin.js
```

When the script detects an existing admin, it will ask if you want to reset the password.

## 🚀 Quick Start

### Interactive Mode (Recommended for first-time users)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Run the update script:**
   ```bash
   node scripts/update-admin.js
   ```

3. **Follow the prompts:**
   - Select the admin account to update
   - Choose what to update (email, password, or both)
   - Enter the new values

### Quick Mode (For updating password only)

If you know the admin email and just want to update the password:

```bash
cd backend
node scripts/update-admin.js admin@hotel.com new-password-here
```

**Example:**
```bash
$ node scripts/update-admin.js admin@hotel.com MyNewPassword123

🔐 Admin Account Update (Quick Mode)
================================

✅ Password updated successfully!
   Admin email: admin@hotel.com
   ⚠️  New password is now active. Please use it for login.

✅ Update completed successfully!
```

## 📝 Notes

- **Password Requirements:** Minimum 6 characters
- **Email Requirements:** Must be a valid email format
- **Security:** Passwords are hashed using bcrypt with 12 salt rounds
- **Multiple Admins:** If you have multiple admin accounts, you'll be prompted to select which one to update

## 🔒 Default Admin Credentials

If you're setting up for the first time, the default credentials are:
- **Email:** `admin@hotel.com`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change the default password immediately after first login!

## 🛠️ Troubleshooting

### "Admins table does not exist"
Run the table creation script first:
```bash
node scripts/create-hotel-tables.js
```

### "Email already exists"
The email address is already in use by another admin account. Choose a different email.

### "Admin account not found"
Make sure you're using the correct admin ID. List all admins first to see available accounts.

## 📚 Related Scripts

- `setup-admin.js` - Create new admin account
- `create-hotel-tables.js` - Create database tables
- `update-admin.js` - Update existing admin credentials (this script)

