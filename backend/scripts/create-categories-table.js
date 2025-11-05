const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function createCategoriesTable() {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Add index for faster lookups
    await client.query('CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)')
    
    // Insert default categories if they don't exist
    const defaultCategories = [
      { name: 'Shower Cabins', slug: 'shower-cabins', description: 'Premium shower cabins and enclosures' },
      { name: 'Accessories', slug: 'accessories', description: 'Shower accessories and add-ons' },
      { name: 'Parts', slug: 'parts', description: 'Replacement parts and components' }
    ]
    
    for (const category of defaultCategories) {
      await client.query(
        'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING',
        [category.name, category.slug, category.description]
      )
    }
    
    await client.query('COMMIT')
    console.log('Categories table created successfully')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating categories table:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

createCategoriesTable()
  .then(() => console.log('Migration completed'))
  .catch(err => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
