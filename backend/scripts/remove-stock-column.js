const { Pool } = require('pg');

// Database configuration - replace with your actual database credentials
const pool = new Pool({
  user: 'your_db_user',
  host: 'your_db_host',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432, // Default PostgreSQL port
  ssl: { rejectUnauthorized: false } // Required for Neon PostgreSQL
});

// Simple query helper
const query = (text, params) => pool.query(text, params);

async function removeStockColumn() {
  try {
    // Check if the stock column exists
    const checkColumn = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='stock'
    `);

    if (checkColumn.rows.length > 0) {
      // Remove the stock column
      await db.query(`
        ALTER TABLE products 
        DROP COLUMN IF EXISTS stock
      `);
      console.log('✅ Removed stock column from products table');
    } else {
      console.log('ℹ️ Stock column does not exist in products table');
    }

    console.log('🎉 Stock removal migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.end();
    process.exit(0);
  }
}

removeStockColumn();
