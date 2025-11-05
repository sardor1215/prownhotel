const path = require('path');
const fs = require('fs');

// Load .env file from backend directory (parent directory)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config(); // Fallback to default
}

const db = require('../config/database');

async function fixSchemaPermissions() {
  const client = await db.pool.connect();
  
  try {
    console.log('🔧 Attempting to fix schema permissions...\n');

    // Try various permission granting commands
    const commands = [
      { name: 'Grant CREATE on public schema', sql: 'GRANT CREATE ON SCHEMA public TO PUBLIC' },
      { name: 'Grant ALL on public schema', sql: 'GRANT ALL ON SCHEMA public TO PUBLIC' },
      { name: 'Grant usage on public schema', sql: 'GRANT USAGE ON SCHEMA public TO PUBLIC' },
      { name: 'Set default privileges', sql: 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO PUBLIC' },
    ];

    for (const cmd of commands) {
      try {
        await client.query(cmd.sql);
        console.log(`✅ ${cmd.name}`);
      } catch (error) {
        console.log(`⚠️  ${cmd.name} - ${error.message}`);
      }
    }

    console.log('\n✅ Permission fixing completed!');
    console.log('\n💡 If you still get permission errors:');
    console.log('   1. Contact your database provider (Neon, Heroku, etc.)');
    console.log('   2. Use a database admin/superuser account');
    console.log('   3. Check if your database plan allows table creation');
    console.log('   4. Try creating tables manually via your database dashboard\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  fixSchemaPermissions();
}

module.exports = fixSchemaPermissions;


