const db = require('../config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminResult = await db.query(`
      INSERT INTO users (name, email, password, phone, role) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['Admin User', 'admin@showecabin.com', hashedPassword, '+1234567890', 'admin']);

    const adminId = adminResult.rows[0]?.id;

    // Create sample customer
    const customerPassword = await bcrypt.hash('customer123', 12);
    const customerResult = await db.query(`
      INSERT INTO users (name, email, password, phone, address, role) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['John Doe', 'customer@example.com', customerPassword, '+1987654321', '123 Main St, City, State 12345', 'customer']);

    const customerId = customerResult.rows[0]?.id;

    // Create categories
    const categories = [
      { name: 'Walk-in Showers', description: 'Modern walk-in shower enclosures' },
      { name: 'Shower Doors', description: 'Glass shower doors and enclosures' },
      { name: 'Shower Trays', description: 'Shower bases and trays' },
      { name: 'Shower Accessories', description: 'Shower heads, handles, and accessories' },
      { name: 'Corner Showers', description: 'Space-saving corner shower units' }
    ];

    const categoryIds = [];
    for (const category of categories) {
      const result = await db.query(`
        INSERT INTO categories (name, description) 
        VALUES ($1, $2) 
        ON CONFLICT (name) DO NOTHING
        RETURNING id
      `, [category.name, category.description]);
      
      if (result.rows[0]) {
        categoryIds.push(result.rows[0].id);
      }
    }

    // Create sample products
    const products = [
      {
        name: 'Modern Walk-in Shower Enclosure',
        description: 'Contemporary walk-in shower with frameless glass panels. Features a sleek design with chrome fixtures and easy-clean glass. Perfect for modern bathrooms.',
        price: 899.99,
        category_id: categoryIds[0],
        stock: 15,
        dimensions: '1200x900x2000mm',
        material: 'Tempered Glass, Chrome',
        features: JSON.stringify(['Frameless design', 'Easy-clean coating', 'Chrome fixtures', 'Sliding door'])
      },
      {
        name: 'Corner Shower Unit',
        description: 'Space-efficient corner shower unit with sliding doors. Includes built-in shelf and anti-slip base. Ideal for smaller bathrooms.',
        price: 649.99,
        category_id: categoryIds[4],
        stock: 8,
        dimensions: '900x900x2000mm',
        material: 'Tempered Glass, Acrylic',
        features: JSON.stringify(['Corner fit', 'Sliding doors', 'Built-in shelf', 'Anti-slip base'])
      },
      {
        name: 'Premium Shower Door',
        description: 'High-quality frameless shower door with pivot hinge system. Features premium glass and elegant hardware. Adds luxury to any bathroom.',
        price: 449.99,
        category_id: categoryIds[1],
        stock: 12,
        dimensions: '800x2000mm',
        material: 'Tempered Glass, Stainless Steel',
        features: JSON.stringify(['Frameless design', 'Pivot hinge', 'Premium hardware', 'Easy installation'])
      },
      {
        name: 'Acrylic Shower Tray',
        description: 'Durable acrylic shower tray with anti-slip surface. Available in multiple sizes and colors. Easy to install and maintain.',
        price: 199.99,
        category_id: categoryIds[2],
        stock: 25,
        dimensions: '1200x800x40mm',
        material: 'Acrylic',
        features: JSON.stringify(['Anti-slip surface', 'Easy installation', 'Multiple sizes', 'Low maintenance'])
      },
      {
        name: 'Rainfall Shower Head',
        description: 'Luxury rainfall shower head with multiple spray patterns. Features water-saving technology and easy-clean nozzles.',
        price: 89.99,
        category_id: categoryIds[3],
        stock: 30,
        dimensions: '300mm diameter',
        material: 'Stainless Steel',
        features: JSON.stringify(['Rainfall effect', 'Multiple patterns', 'Water-saving', 'Easy-clean nozzles'])
      },
      {
        name: 'Glass Shower Enclosure',
        description: 'Semi-frameless glass shower enclosure with hinged door. Includes towel bar and soap dish. Perfect balance of style and functionality.',
        price: 599.99,
        category_id: categoryIds[1],
        stock: 10,
        dimensions: '1000x1000x2000mm',
        material: 'Tempered Glass, Chrome',
        features: JSON.stringify(['Semi-frameless', 'Hinged door', 'Towel bar', 'Soap dish'])
      },
      {
        name: 'Walk-in Shower with Seat',
        description: 'Accessible walk-in shower with built-in seat and grab bars. Features anti-slip flooring and easy-access design.',
        price: 1299.99,
        category_id: categoryIds[0],
        stock: 5,
        dimensions: '1500x1200x2000mm',
        material: 'Tempered Glass, Stainless Steel',
        features: JSON.stringify(['Built-in seat', 'Grab bars', 'Anti-slip floor', 'Accessible design'])
      },
      {
        name: 'Shower Handle Set',
        description: 'Complete shower handle set with soap dish and towel ring. Chrome finish with easy installation.',
        price: 79.99,
        category_id: categoryIds[3],
        stock: 40,
        dimensions: 'Various',
        material: 'Chrome-plated Brass',
        features: JSON.stringify(['Complete set', 'Easy installation', 'Chrome finish', 'Includes soap dish'])
      }
    ];

    const productIds = [];
    for (const product of products) {
      const result = await db.query(`
        INSERT INTO products (name, description, price, category_id, stock, dimensions, material, features, created_by) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING id
      `, [
        product.name, 
        product.description, 
        product.price, 
        product.category_id, 
        product.stock, 
        product.dimensions, 
        product.material, 
        product.features,
        adminId
      ]);
      
      productIds.push(result.rows[0].id);
    }

    // Add sample reviews
    if (customerId && productIds.length > 0) {
      const reviews = [
        {
          user_id: customerId,
          product_id: productIds[0],
          rating: 5,
          comment: 'Excellent quality and easy installation. The glass is crystal clear and the fixtures are sturdy.'
        },
        {
          user_id: customerId,
          product_id: productIds[1],
          rating: 4,
          comment: 'Perfect for our small bathroom. The corner design saves so much space and looks great.'
        },
        {
          user_id: customerId,
          product_id: productIds[4],
          rating: 5,
          comment: 'Amazing shower head! The rainfall effect is so relaxing and the water pressure is perfect.'
        }
      ];

      for (const review of reviews) {
        await db.query(`
          INSERT INTO reviews (user_id, product_id, rating, comment) 
          VALUES ($1, $2, $3, $4) 
          ON CONFLICT (user_id, product_id) DO NOTHING
        `, [review.user_id, review.product_id, review.rating, review.comment]);
      }
    }

    // Add sample wishlist items
    if (customerId && productIds.length > 0) {
      await db.query(`
        INSERT INTO wishlist (user_id, product_id) 
        VALUES ($1, $2), ($1, $3) 
        ON CONFLICT (user_id, product_id) DO NOTHING
      `, [customerId, productIds[2], productIds[5]]);
    }

    console.log('✅ Sample data seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@showecabin.com / admin123');
    console.log('Customer: customer@example.com / customer123');
    console.log('\n🎉 Database is ready to use!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData(); 