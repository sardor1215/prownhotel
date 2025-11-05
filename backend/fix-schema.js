require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixSchema() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Dropping existing tables...');
    await client.query('DROP TABLE IF EXISTS simple_order_items CASCADE');
    await client.query('DROP TABLE IF EXISTS simple_orders CASCADE');
    await client.query('DROP TABLE IF EXISTS product_images CASCADE');
    await client.query('DROP TABLE IF EXISTS reviews CASCADE');
    await client.query('DROP TABLE IF EXISTS products CASCADE');
    await client.query('DROP TABLE IF EXISTS categories CASCADE');
    await client.query('DROP TABLE IF EXISTS admins CASCADE');
    
    console.log('Recreating tables with correct schema...');
    await require('./create-tables-direct').createTables();
    
    await client.query('COMMIT');
    console.log('✅ Schema fixed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
fixSchema().catch(console.error);
