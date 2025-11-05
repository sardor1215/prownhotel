const db = require('../config/database');

async function addSlugColumn() {
  try {
    console.log('🔄 Adding slug column to categories table...');
    
    // Add slug column if it doesn't exist
    await db.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE
    `);
    
    console.log('✅ Added slug column to categories table');
    
    // If you want to generate slugs for existing categories:
    const { rows: categories } = await db.query('SELECT id, name FROM categories');
    
    for (const category of categories) {
      const slug = category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      await db.query(
        'UPDATE categories SET slug = $1 WHERE id = $2',
        [slug, category.id]
      );
    }
    
    console.log('✅ Generated slugs for existing categories');
    
    // Make slug column required
    await db.query(`
      ALTER TABLE categories 
      ALTER COLUMN slug SET NOT NULL
    `);
    
    console.log('✅ Made slug column required');
    
  } catch (error) {
    console.error('❌ Error adding slug column:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

addSlugColumn();
