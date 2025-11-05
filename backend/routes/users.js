const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id,
        name,
        email,
        phone,
        address,
        role,
        created_at,
        updated_at
      FROM users 
      WHERE id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('address').optional().trim().isLength({ min: 10 }).withMessage('Address must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, address } = req.body;
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (phone) {
      updateFields.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }

    if (address) {
      updateFields.push(`address = $${paramCount}`);
      values.push(address);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.user.id);
    const result = await db.query(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING id, name, email, phone, address, role`,
      values
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's order history
router.get('/orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['o.user_id = $1'];
    let values = [req.user.id];
    let paramCount = 2;

    if (status) {
      whereConditions.push(`o.status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    const result = await db.query(`
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.payment_method,
        o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...values, parseInt(limit), offset]);

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM orders
      WHERE ${whereConditions.join(' AND ')}
    `, values);

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
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's wishlist
router.get('/wishlist', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        w.id as wishlist_id,
        p.id as product_id,
        p.name,
        p.price,
        p.main_image,
        p.stock,
        c.name as category_name
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [req.user.id]);

    res.json({ wishlist: result.rows });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to wishlist
router.post('/wishlist', auth, [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id } = req.body;

    // Check if product exists
    const productResult = await db.query(
      'SELECT id FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if already in wishlist
    const existingWishlistItem = await db.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existingWishlistItem.rows.length > 0) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    // Add to wishlist
    await db.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)',
      [req.user.id, product_id]
    );

    res.status(201).json({ message: 'Product added to wishlist successfully' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from wishlist
router.delete('/wishlist/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await db.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING id',
      [req.user.id, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.json({ message: 'Product removed from wishlist successfully' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's reviews
router.get('/reviews', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        p.id as product_id,
        p.name as product_name,
        p.main_image as product_image
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), offset]);

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM reviews WHERE user_id = $1',
      [req.user.id]
    );

    const totalReviews = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      reviews: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add review for a product
router.post('/reviews', auth, [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ min: 10 }).withMessage('Comment must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, rating, comment } = req.body;

    // Check if product exists
    const productResult = await db.query(
      'SELECT id FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user has purchased the product
    const purchaseResult = await db.query(`
      SELECT oi.id
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = $1 AND o.user_id = $2 AND o.status = 'delivered'
      LIMIT 1
    `, [product_id, req.user.id]);

    if (purchaseResult.rows.length === 0) {
      return res.status(400).json({ error: 'You can only review products you have purchased' });
    }

    // Check if user already reviewed this product
    const existingReview = await db.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Add review
    const result = await db.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, product_id, rating, comment]
    );

    res.status(201).json({
      message: 'Review added successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update review
router.put('/reviews/:reviewId', auth, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ min: 10 }).withMessage('Comment must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (rating !== undefined) {
      updateFields.push(`rating = $${paramCount}`);
      values.push(rating);
      paramCount++;
    }

    if (comment !== undefined) {
      updateFields.push(`comment = $${paramCount}`);
      values.push(comment);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(reviewId, req.user.id);
    const result = await db.query(
      `UPDATE reviews SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({
      message: 'Review updated successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete review
router.delete('/reviews/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const result = await db.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
      [reviewId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 