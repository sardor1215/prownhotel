const path = require('path');
const fs = require('fs');

// Load .env file from backend directory (parent directory)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  // Try alternative locations
  const altEnvPath = path.join(__dirname, '..', '..', '.env');
  if (fs.existsSync(altEnvPath)) {
    require('dotenv').config({ path: altEnvPath });
  } else {
    require('dotenv').config(); // Fallback to default
  }
}

const bcrypt = require('bcryptjs'); // Use bcryptjs to match package.json
const db = require('../config/database');

async function setupAdmin() {
  const client = await db.pool.connect();
  
  try {
    console.log('Setting up admin user...');

    // Check if admin table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admins'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Admins table does not exist. Please run create-hotel-tables.js first.');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await client.query(
      'SELECT * FROM admins WHERE email = $1',
      ['admin@hotel.com']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin user already exists!');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('Do you want to reset the password? (yes/no): ', async (answer) => {
        readline.close();
        
        if (answer.toLowerCase() === 'yes') {
          const password = 'admin123'; // Default password
          const hashedPassword = await bcrypt.hash(password, 12); // Use 12 rounds to match login route
          
          await client.query(
            'UPDATE admins SET password = $1, updated_at = NOW() WHERE email = $2',
            [hashedPassword, 'admin@hotel.com']
          );
          
          console.log('✅ Admin password reset successfully!');
          console.log('Email: admin@hotel.com');
          console.log('Password: admin123');
          console.log('⚠️  Please change this password after first login!');
        }
        
        client.release();
        process.exit(0);
      });
      return;
    }

    // Create new admin user
    const password = 'admin123'; // Default password
    const hashedPassword = await bcrypt.hash(password, 12); // Use 12 rounds to match login route
    
    await client.query(`
      INSERT INTO admins (email, password, name)
      VALUES ($1, $2, $3)
    `, ['admin@hotel.com', hashedPassword, 'Hotel Administrator']);

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('=================================');
    console.log('Admin Credentials:');
    console.log('Email: admin@hotel.com');
    console.log('Password: admin123');
    console.log('=================================');
    console.log('');
    console.log('⚠️  IMPORTANT: Please change this password after first login!');
    console.log('');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script
if (require.main === module) {
  setupAdmin()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupAdmin;


