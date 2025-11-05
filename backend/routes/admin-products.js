const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { adminAuth } = require('../middleware/admin-auth');

const router = express.Router();

// Get all products (admin view with more details)
router.get('/products', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.main_image, p.images, 
        p.category_id, c.name as category_name, p.specifications, 
        p.created_at, p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    
    let params = [];
    let whereConditions = [];

    if (category) {
      whereConditions.push(`p.category_id = $${params.length + 1}`);
      params.push(category);
    }

    if (search) {
      whereConditions.push(`(name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM products p';
    let countParams = [];
    let countWhereConditions = [];

    // Rebuild where conditions for count query (without the table aliases)
    if (category) {
      countWhereConditions.push(`p.category_id = $${countParams.length + 1}`);
      countParams.push(category);
    }
    
    if (search) {
      countWhereConditions.push(`(p.name ILIKE $${countParams.length + 1} OR p.description ILIKE $${countParams.length + 1})`);
      countParams.push(`%${search}%`);
    }

    if (countWhereConditions.length > 0) {
      countQuery += ` WHERE ${countWhereConditions.join(' AND ')}`;
    }

    const countResult = await db.query(countQuery, countParams);
    const totalProducts = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product
router.get('/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get the product
    const productResult = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];
    
    // Get the product images
    const imagesResult = await db.query(
      'SELECT id, image_url, alt_text, sort_order FROM product_images WHERE product_id = $1 ORDER BY sort_order',
      [id]
    );
    
    // Combine the product with its images
    const productWithImages = {
      ...product,
      images: imagesResult.rows
    };

    res.json({ product: productWithImages });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new product
router.post('/products', adminAuth, [
  body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category_id').isInt({ min: 1 }).withMessage('A valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      name, 
      description, 
      price, 
      main_image, 
      images, 
      category_id, 
      specifications 
    } = req.body;

    // Start a database transaction
    await db.query('BEGIN');
    
    // Insert the main product
    const productResult = await db.query(
      `INSERT INTO products 
       (name, description, price, main_image, images, category_id, specifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, 
      [
        name, 
        description, 
        parseFloat(price), 
        main_image || null,
        images || [],
        category_id, 
        specifications || {}
      ]
    );
    
    const product = productResult.rows[0];
    
    // Insert images into product_images table
    if (images && images.length > 0) {
      const imageValues = images.map((imageUrl, index) => {
        const isMain = index === 0 && !main_image;
        return `($1, $${index * 3 + 2}, $${index * 3 + 3}, $${index * 3 + 4})`;
      }).join(', ');
      
      const imageParams = [product.id];
      images.forEach((imageUrl, index) => {
        imageParams.push(imageUrl);
        imageParams.push(`Image ${index + 1} for ${name}`);
        imageParams.push(index);
      });
      
      await db.query(
        `INSERT INTO product_images (product_id, image_url, alt_text, sort_order)
         VALUES ${imageValues}
         RETURNING *`,
        imageParams
      );
    }
    
    // Commit the transaction
    await db.query('COMMIT');
    
    // Get the full product with images
    const fullProduct = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [product.id]
    );
    
    res.status(201).json({
      message: 'Product created successfully',
      product: fullProduct.rows[0]
    });

  } catch (error) {
    // Rollback the transaction in case of error
    await db.query('ROLLBACK');
    console.error('Create product error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

// Update product
router.put('/products/:id', adminAuth, [
  body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      main_image, 
      images, 
      category_id, 
      specifications 
    } = req.body;

    const result = await db.query(`
      UPDATE products 
      SET name = $1, description = $2, price = $3, main_image = $4, 
          images = $5, category_id = $6, specifications = $7, 
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [
      name, 
      description, 
      parseFloat(price), 
      main_image, 
      images || [], 
      category_id, 
      specifications || {},
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all orders (admin view)
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.id, o.email, o.phone, o.total_amount, o.status, o.notes, o.created_at,
        COUNT(oi.id) as item_count
      FROM simple_orders o
      LEFT JOIN simple_order_items oi ON o.id = oi.order_id
    `;
    
    let params = [];
    
    if (status) {
      query += ` WHERE o.status = $1`;
      params.push(status);
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM simple_orders';
    let countParams = [];

    if (status) {
      countQuery += ' WHERE status = $1';
      countParams.push(status);
    }

    const countResult = await db.query(countQuery, countParams);
    const totalOrders = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order details
router.get('/orders/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get order info
    const orderResult = await db.query(
      'SELECT * FROM simple_orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await db.query(
      'SELECT * FROM simple_order_items WHERE order_id = $1',
      [id]
    );

    res.json({
      order: {
        ...order,
        items: itemsResult.rows
      }
    });

  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status
router.put('/orders/:id/status', adminAuth, [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      'UPDATE simple_orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
