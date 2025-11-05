const path = require('path');
const fs = require('fs');

// Load .env file from backend directory (parent directory)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log(`✅ Loaded .env from: ${envPath}`);
} else {
  // Try alternative locations
  const altEnvPath = path.join(__dirname, '..', '..', '.env');
  if (fs.existsSync(altEnvPath)) {
    require('dotenv').config({ path: altEnvPath });
    console.log(`✅ Loaded .env from: ${altEnvPath}`);
  } else {
    console.log('⚠️  No .env file found. Trying default location...');
    require('dotenv').config(); // Fallback to default
  }
}

// Verify required environment variables
if (!process.env.DB_NAME && !process.env.DATABASE_URL) {
  console.error('\n❌ ERROR: Database configuration not found!');
  console.error('Please ensure your .env file exists in the backend directory with:');
  console.error('  - DB_HOST');
  console.error('  - DB_PORT');
  console.error('  - DB_NAME');
  console.error('  - DB_USER');
  console.error('  - DB_PASSWORD');
  console.error('\nOr use DATABASE_URL instead.\n');
  process.exit(1);
}

const bcrypt = require('bcryptjs'); // Using bcryptjs to match package.json
const readline = require('readline');
const db = require('../config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function listAdmins() {
  try {
    const result = await db.query('SELECT id, email, name, created_at FROM admins ORDER BY id');
    
    if (result.rows.length === 0) {
      console.log('❌ No admin accounts found.');
      return [];
    }

    console.log('\n📋 Current Admin Accounts:');
    console.log('================================');
    result.rows.forEach((admin, index) => {
      console.log(`${index + 1}. ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name || 'N/A'}`);
      console.log(`   Created: ${admin.created_at}`);
      console.log('');
    });
    console.log('================================\n');

    return result.rows;
  } catch (error) {
    console.error('❌ Error listing admins:', error.message);
    return [];
  }
}

async function updateAdminEmail(adminId, newEmail) {
  try {
    // Check if new email already exists
    const existing = await db.query(
      'SELECT id FROM admins WHERE email = $1 AND id != $2',
      [newEmail, adminId]
    );

    if (existing.rows.length > 0) {
      console.log('❌ Email already exists for another admin account!');
      return false;
    }

    // Update email
    const result = await db.query(
      'UPDATE admins SET email = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newEmail, adminId]
    );

    if (result.rows.length === 0) {
      console.log('❌ Admin account not found!');
      return false;
    }

    console.log('✅ Email updated successfully!');
    console.log(`   New email: ${result.rows[0].email}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating email:', error.message);
    return false;
  }
}

async function updateAdminPassword(adminId, newPassword) {
  try {
    // Validate password length
    if (newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters long!');
      return false;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const result = await db.query(
      'UPDATE admins SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING email',
      [hashedPassword, adminId]
    );

    if (result.rows.length === 0) {
      console.log('❌ Admin account not found!');
      return false;
    }

    console.log('✅ Password updated successfully!');
    console.log(`   Admin email: ${result.rows[0].email}`);
    console.log('   ⚠️  New password is now active. Please use it for login.');
    return true;
  } catch (error) {
    console.error('❌ Error updating password:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Check for command line arguments
    const args = process.argv.slice(2);
    
    // Check if admins table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admins'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Admins table does not exist. Please run create-hotel-tables.js first.');
      process.exit(1);
    }

    // Quick update mode with command line arguments
    if (args.length >= 2) {
      const email = args[0];
      const password = args[1];
      
      console.log('\n🔐 Admin Account Update (Quick Mode)');
      console.log('================================\n');
      
      try {
        // Test database connection first
        await db.query('SELECT 1');
      } catch (error) {
        console.error('❌ Database connection failed!');
        console.error('Error:', error.message);
        console.error('\nPlease check your database configuration in .env file.');
        rl.close();
        process.exit(1);
      }
      
      // Find admin by email
      let adminResult;
      try {
        adminResult = await db.query(
          'SELECT id FROM admins WHERE email = $1',
          [email]
        );
      } catch (error) {
        console.error('❌ Error querying database:', error.message);
        rl.close();
        process.exit(1);
      }
      
      if (adminResult.rows.length === 0) {
        console.log(`❌ Admin account with email "${email}" not found!`);
        rl.close();
        process.exit(1);
      }
      
      const adminId = adminResult.rows[0].id;
      
      // Update password
      const success = await updateAdminPassword(adminId, password);
      
      if (success) {
        console.log('\n✅ Update completed successfully!\n');
      } else {
        console.log('\n❌ Update failed!\n');
        rl.close();
        process.exit(1);
      }
      
      rl.close();
      process.exit(0);
    }

    // Interactive mode
    console.log('\n🔐 Admin Account Management');
    console.log('================================\n');

    // List all admins
    const admins = await listAdmins();

    if (admins.length === 0) {
      console.log('No admin accounts to manage. Exiting...');
      rl.close();
      process.exit(0);
    }

    // Select admin to update
    let adminId;
    if (admins.length === 1) {
      adminId = admins[0].id;
      console.log(`Using admin account: ${admins[0].email}\n`);
    } else {
      const adminChoice = await question('Select admin account number to update: ');
      const selectedIndex = parseInt(adminChoice) - 1;
      
      if (selectedIndex < 0 || selectedIndex >= admins.length) {
        console.log('❌ Invalid selection!');
        rl.close();
        process.exit(1);
      }
      
      adminId = admins[selectedIndex].id;
      console.log(`\nSelected: ${admins[selectedIndex].email}\n`);
    }

    // Choose what to update
    console.log('What would you like to update?');
    console.log('1. Email address');
    console.log('2. Password');
    console.log('3. Both email and password');
    console.log('4. Cancel');

    const choice = await question('\nEnter your choice (1-4): ');

    switch (choice) {
      case '1':
        const newEmail = await question('Enter new email address: ');
        if (newEmail.trim()) {
          await updateAdminEmail(adminId, newEmail.trim());
        } else {
          console.log('❌ Email cannot be empty!');
        }
        break;

      case '2':
        const newPassword = await question('Enter new password (min 6 characters): ');
        if (newPassword.trim()) {
          await updateAdminPassword(adminId, newPassword.trim());
        } else {
          console.log('❌ Password cannot be empty!');
        }
        break;

      case '3':
        const email = await question('Enter new email address: ');
        const password = await question('Enter new password (min 6 characters): ');
        
        if (email.trim() && password.trim()) {
          const emailUpdated = await updateAdminEmail(adminId, email.trim());
          if (emailUpdated) {
            await updateAdminPassword(adminId, password.trim());
          }
        } else {
          console.log('❌ Both email and password are required!');
        }
        break;

      case '4':
        console.log('Operation cancelled.');
        break;

      default:
        console.log('❌ Invalid choice!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updateAdminEmail, updateAdminPassword, listAdmins };

