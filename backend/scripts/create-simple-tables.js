require('dotenv').config();
const db = require('../config/database');

async function createSimpleTables() {
  const client = await db.pool.connect();
  
  try {
    console.log('Creating simplified tables for shower cabin e-commerce...');

    // Create admins table (for admin authentication)
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create products table (if not exists)
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        main_image VARCHAR(500),
        images TEXT[], -- Array of image URLs
        stock INTEGER DEFAULT 0,
        category VARCHAR(100),
        specifications JSONB, -- Store product specs as JSON
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create simple_orders table (no authentication required)
    await client.query(`
      CREATE TABLE IF NOT EXISTS simple_orders (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create simple_order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS simple_order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES simple_orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        product_price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_simple_orders_email ON simple_orders(email);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_simple_orders_status ON simple_orders(status);
    `);

    console.log('✅ Simple tables created successfully!');

    // Insert sample products if table is empty
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      console.log('Inserting sample shower cabin products...');
      
      await client.query(`
        INSERT INTO products (name, description, price, main_image, stock, category, specifications) VALUES
        ('Premium Glass Shower Cabin', 'Modern tempered glass shower cabin with sliding doors', 899.99, '/images/premium-glass-cabin.jpg', 10, 'Glass Cabins', '{"width": "120cm", "height": "200cm", "glass_thickness": "8mm", "door_type": "sliding"}'),
        ('Corner Shower Cabin', 'Space-saving corner shower cabin with pivot door', 649.99, '/images/corner-cabin.jpg', 15, 'Corner Cabins', '{"width": "90cm", "height": "200cm", "glass_thickness": "6mm", "door_type": "pivot"}'),
        ('Steam Shower Cabin', 'Luxury steam shower cabin with digital controls', 1299.99, '/images/steam-cabin.jpg', 5, 'Steam Cabins', '{"width": "100cm", "height": "220cm", "features": ["steam generator", "digital controls", "LED lighting"], "power": "3kW"}'),
        ('Walk-in Shower Screen', 'Minimalist walk-in shower screen', 399.99, '/images/walk-in-screen.jpg', 20, 'Walk-in', '{"width": "100cm", "height": "200cm", "glass_thickness": "10mm", "style": "fixed panel"}'),
        ('Quadrant Shower Cabin', 'Curved quadrant shower cabin for small bathrooms', 549.99, '/images/quadrant-cabin.jpg', 12, 'Quadrant', '{"radius": "80cm", "height": "190cm", "glass_thickness": "6mm", "door_type": "sliding"}'),
        ('Luxury Shower Cabin with Tray', 'Complete shower solution with acrylic tray', 799.99, '/images/luxury-with-tray.jpg', 8, 'Complete Sets', '{"width": "120cm", "depth": "80cm", "height": "200cm", "tray_material": "acrylic", "includes": ["cabin", "tray", "waste"]}')`
      );
      
      console.log('✅ Sample products inserted!');
    }

    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
if (require.main === module) {
  createSimpleTables()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = createSimpleTables;
