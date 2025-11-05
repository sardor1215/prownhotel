const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/cart', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        c.id as cart_id,
        c.quantity,
        p.id as product_id,
        p.name,
        p.price,
        p.main_image,
        p.stock
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    const cartItems = result.rows;
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      cart: cartItems,
      total: total,
      itemCount: cartItems.length
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to cart
router.post('/cart', auth, [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, quantity } = req.body;

    // Check if product exists and has enough stock
    const productResult = await db.query(
      'SELECT id, name, price, stock FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    // Check if item already exists in cart
    const existingCartItem = await db.query(
      'SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existingCartItem.rows.length > 0) {
      // Update existing cart item
      const newQuantity = existingCartItem.rows[0].quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: 'Not enough stock available' });
      }

      await db.query(
        'UPDATE cart SET quantity = $1, updated_at = NOW() WHERE id = $2',
        [newQuantity, existingCartItem.rows[0].id]
      );

      res.json({ message: 'Cart updated successfully' });
    } else {
      // Add new cart item
      await db.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [req.user.id, product_id, quantity]
      );

      res.status(201).json({ message: 'Item added to cart successfully' });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart item quantity
router.put('/cart/:cartId', auth, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cartId } = req.params;
    const { quantity } = req.body;

    // Check if cart item exists and belongs to user
    const cartItemResult = await db.query(`
      SELECT c.id, p.stock, p.name
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.id = $1 AND c.user_id = $2
    `, [cartId, req.user.id]);

    if (cartItemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const cartItem = cartItemResult.rows[0];
    if (cartItem.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    await db.query(
      'UPDATE cart SET quantity = $1, updated_at = NOW() WHERE id = $2',
      [quantity, cartId]
    );

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cart
router.delete('/cart/:cartId', auth, async (req, res) => {
  try {
    const { cartId } = req.params;

    const result = await db.query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id',
      [cartId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear cart
router.delete('/cart', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order (checkout)
router.post('/checkout', auth, [
  body('shipping_address').trim().isLength({ min: 10 }).withMessage('Shipping address is required'),
  body('payment_method').isIn(['credit_card', 'paypal', 'bank_transfer']).withMessage('Valid payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shipping_address, payment_method, notes } = req.body;

    // Get cart items
    const cartResult = await db.query(`
      SELECT 
        c.quantity,
        p.id as product_id,
        p.name,
        p.price,
        p.stock
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `, [req.user.id]);

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const cartItems = cartResult.rows;
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check stock availability
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Not enough stock for ${item.name}. Available: ${item.stock}` 
        });
      }
    }

    // Start transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Create order
      const orderResult = await client.query(`
        INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [req.user.id, total, shipping_address, payment_method, notes, 'pending']);

      const orderId = orderResult.rows[0].id;

      // Create order items and update stock
      for (const item of cartItems) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `, [orderId, item.product_id, item.quantity, item.price]);

        await client.query(`
          UPDATE products SET stock = stock - $1 WHERE id = $2
        `, [item.quantity, item.product_id]);
      }

      // Clear cart
      await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Order created successfully',
        orderId: orderId,
        total: total
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

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
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), offset]);

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
      [req.user.id]
    );

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
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order details
router.get('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order info
    const orderResult = await db.query(`
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1 AND o.user_id = $2
    `, [orderId, req.user.id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await db.query(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.main_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);

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

// Cancel order
router.put('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and belongs to user
    const orderResult = await db.query(
      'SELECT id, status FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    // Start transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Update order status
      await client.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
        ['cancelled', orderId]
      );

      // Restore stock
      const itemsResult = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );

      for (const item of itemsResult.rows) {
        await client.query(`
          UPDATE products SET stock = stock + $1 WHERE id = $2
        `, [item.quantity, item.product_id]);
      }

      await client.query('COMMIT');

      res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 