const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const sampleProducts = [
  {
    name: 'Luxury Glass Shower Cabin',
    description: 'Premium glass shower cabin with rain shower head and body jets',
    price: 1299.99,
    main_image: '/images/shower1.jpg',
    images: ['/images/shower1-1.jpg', '/images/shower1-2.jpg'],
    stock: 10,
    category_id: 1, // Shower Cabins
    specifications: {
      dimensions: '120x120x215 cm',
      material: 'Tempered Glass, Aluminum',
      features: ['Rain Shower', 'Body Jets', 'Steam Function', 'LED Lighting']
    }
  },
  {
    name: 'Corner Shower Enclosure',
    description: 'Space-saving corner shower enclosure with sliding doors',
    price: 899.99,
    main_image: '/images/shower2.jpg',
    images: ['/images/shower2-1.jpg', '/images/shower2-2.jpg'],
    stock: 15,
    category_id: 1, // Shower Cabins
    specifications: {
      dimensions: '90x90x215 cm',
      material: 'Tempered Glass, Chrome',
      features: ['Sliding Doors', 'Anti-lime Coating', 'Easy Clean Glass']
    }
  },
  {
    name: 'Shower Head Set',
    description: 'High-pressure shower head set with handheld sprayer',
    price: 129.99,
    main_image: '/images/accessory1.jpg',
    images: ['/images/accessory1-1.jpg'],
    stock: 30,
    category_id: 2, // Accessories
    specifications: {
      type: 'Shower System',
      material: 'Stainless Steel',
      features: ['Adjustable Spray', 'Water Saving', 'Easy Installation']
    }
  },
  {
    name: 'Shower Drain',
    description: 'Stainless steel shower drain with linear design',
    price: 89.99,
    main_image: '/images/accessory2.jpg',
    images: [],
    stock: 45,
    category_id: 2, // Accessories
    specifications: {
      type: 'Linear Drain',
      material: 'Stainless Steel',
      features: ['Anti-odor', 'Easy Clean', 'Modern Design']
    }
  },
  {
    name: 'Shower Door Handle',
    description: 'Replacement handle for shower doors',
    price: 29.99,
    main_image: '/images/part1.jpg',
    images: [],
    stock: 100,
    category_id: 3, // Parts
    specifications: {
      type: 'Replacement Part',
      material: 'Stainless Steel',
      compatibility: 'Standard shower doors'
    }
  }
];

async function insertSampleProducts() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Inserting sample products...');
    
    for (const product of sampleProducts) {
      const { rows } = await client.query(
        `INSERT INTO products (
          name, description, price, main_image, images, 
          stock, category_id, specifications, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id`,
        [
          product.name,
          product.description,
          product.price,
          product.main_image,
          product.images,
          product.stock,
          product.category_id,
          JSON.stringify(product.specifications)
        ]
      );
      
      console.log(`Inserted product: ${product.name} (ID: ${rows[0].id})`);
    }
    
    await client.query('COMMIT');
    console.log('Successfully inserted all sample products');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting sample products:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

insertSampleProducts()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
