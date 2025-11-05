require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTables() {
  try {
    console.log('Creating tables...');
    
    // Create admins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Admins table created');

    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Categories table created');

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        main_image VARCHAR(500),
        stock INTEGER DEFAULT 0,
        category_id INTEGER REFERENCES categories(id),
        dimensions VARCHAR(255),
        material VARCHAR(255),
        features TEXT,
        images TEXT[],
        specifications JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Products table created');

    // Create reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Reviews table created');

    // Create product_images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255),
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Product images table created');

    // Create simple_orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS simple_orders (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        notes TEXT,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Simple orders table created');

    // Create simple_order_items table
    await pool.query(`
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
    console.log('✅ Simple order items table created');

    // Insert sample categories
    const sampleCategories = [
      { name: 'Shower Cabins', description: 'Complete shower cabin units' },
      { name: 'Shower Doors', description: 'Glass shower doors and panels' },
      { name: 'Shower Accessories', description: 'Shower heads, handles, and accessories' },
      { name: 'Walk-in Showers', description: 'Spacious walk-in shower solutions' }
    ];

    for (const category of sampleCategories) {
      await pool.query(`
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [category.name, category.description]);
    }
    console.log('✅ Sample categories inserted');

    // Insert sample products
    const sampleProducts = [
      {
        name: 'Premium Glass Shower Cabin',
        description: 'Luxury tempered glass shower cabin with chrome fixtures',
        price: 1299.99,
        stock: 15,
        category_id: 1,
        dimensions: '120x80x200cm',
        material: 'Tempered Glass',
        features: 'Chrome fixtures, sliding door, rainfall showerhead',
        main_image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80',
        specifications: JSON.stringify({
          glass_thickness: '8mm',
          frame_material: 'Chrome',
          door_type: 'Sliding'
        })
      },
      {
        name: 'Modern Corner Shower Unit',
        description: 'Space-saving corner shower unit with rainfall showerhead',
        price: 899.99,
        stock: 8,
        category_id: 1,
        dimensions: '90x90x200cm',
        material: 'Tempered Glass',
        features: 'Brushed steel frame, pivot door, corner design',
        main_image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        specifications: JSON.stringify({
          glass_thickness: '6mm',
          frame_material: 'Brushed Steel',
          door_type: 'Pivot'
        })
      },
      {
        name: 'Luxury Walk-in Shower',
        description: 'Spacious walk-in shower with frameless glass panels',
        price: 1599.99,
        stock: 5,
        category_id: 4,
        dimensions: '150x100x200cm',
        material: 'Frameless Glass',
        features: 'Frameless design, large space, premium fixtures',
        main_image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
        specifications: JSON.stringify({
          glass_thickness: '10mm',
          frame_material: 'Frameless',
          door_type: 'Open'
        })
      },
      {
        name: 'Compact Shower Door',
        description: 'Space-efficient shower door for small bathrooms',
        price: 399.99,
        stock: 20,
        category_id: 2,
        dimensions: '80x190cm',
        material: 'Safety Glass',
        features: 'Compact design, easy installation, durable hinges',
        main_image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
        specifications: JSON.stringify({
          glass_thickness: '6mm',
          frame_material: 'Aluminum',
          door_type: 'Hinged'
        })
      }
    ];

    for (const product of sampleProducts) {
      await pool.query(`
        INSERT INTO products (name, description, price, stock, category_id, dimensions, material, features, main_image, specifications)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING
      `, [
        product.name,
        product.description,
        product.price,
        product.stock,
        product.category_id,
        product.dimensions,
        product.material,
        product.features,
        product.main_image,
        product.specifications
      ]);
    }
    console.log('✅ Sample products inserted');

    console.log('🎉 All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables();
