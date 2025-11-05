const path = require('path');
const fs = require('fs');

// Load .env file from backend directory (parent directory)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function testAdminLogin() {
  try {
    console.log('🔐 Testing Admin Login Credentials\n');
    console.log('================================\n');

    // Find admin
    const adminResult = await db.query(
      'SELECT id, email, password, name FROM admins WHERE email = $1',
      ['admin@hotel.com']
    );

    if (adminResult.rows.length === 0) {
      console.log('❌ Admin account not found!');
      console.log('Run: node scripts/setup-admin.js');
      process.exit(1);
    }

    const admin = adminResult.rows[0];
    console.log(`✅ Admin found: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   ID: ${admin.id}\n`);

    // Test password
    const testPassword = 'admin123';
    console.log(`Testing password: "${testPassword}"\n`);

    const isPasswordValid = await bcrypt.compare(testPassword, admin.password);

    if (isPasswordValid) {
      console.log('✅ Password is CORRECT!');
      console.log('   You can login with:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${testPassword}\n`);
    } else {
      console.log('❌ Password is INCORRECT!');
      console.log('   The stored password hash does not match "admin123"');
      console.log('\n💡 Resetting password to "admin123"...\n');

      // Reset password
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      await db.query(
        'UPDATE admins SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, admin.id]
      );

      console.log('✅ Password reset successfully!');
      console.log('   You can now login with:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${testPassword}\n`);
    }

    // Test database connection
    console.log('Testing database connection...');
    await db.query('SELECT 1');
    console.log('✅ Database connection working\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the test
if (require.main === module) {
  testAdminLogin();
}

module.exports = testAdminLogin;


