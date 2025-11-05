const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function recreateCategoriesTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migration...');
    await client.query('BEGIN');
    
    // Drop existing tables that depend on categories first
    await client.query(`
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
    `);
    
    console.log('✅ Dropped existing tables');
    
    // Create categories table with slug column
    await client.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Created categories table');
    
    // Add default categories
    const defaultCategories = [
      { name: 'Shower Cabins', slug: 'shower-cabins', description: 'Premium shower cabins and enclosures' },
      { name: 'Accessories', slug: 'accessories', description: 'Shower accessories and add-ons' },
      { name: 'Parts', slug: 'parts', description: 'Replacement parts and components' }
    ];
    
    for (const category of defaultCategories) {
      await client.query(
        'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3)',
        [category.name, category.slug, category.description]
      );
    }
    
    // Recreate products table with proper foreign key
    await client.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        stock INTEGER DEFAULT 0,
        main_image VARCHAR(500),
        images TEXT[],
        specifications JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query('COMMIT');
    console.log('✅ Successfully recreated database schema with categories and products tables');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
    console.log('📊 Migration completed');
    process.exit(0);
  }
}

recreateCategoriesTable().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
