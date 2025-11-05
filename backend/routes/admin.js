const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { adminAuth } = require('../middleware/admin-auth');

const router = express.Router();

// Dashboard analytics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get total sales
    const salesResult = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value
      FROM orders 
      WHERE status != 'cancelled'
    `);

    // Get recent orders
    const recentOrdersResult = await db.query(`
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    // Get low stock products
    const lowStockResult = await db.query(`
      SELECT id, name, stock, price
      FROM products
      WHERE stock <= 5
      ORDER BY stock ASC
      LIMIT 10
    `);

    // Get top selling products
    const topProductsResult = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id, p.name, p.price
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    // Get monthly sales data
    const monthlySalesResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as orders,
        SUM(total_amount) as revenue
      FROM orders
      WHERE status != 'cancelled'
      AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    res.json({
      analytics: {
        totalOrders: parseInt(salesResult.rows[0].total_orders) || 0,
        totalRevenue: parseFloat(salesResult.rows[0].total_revenue) || 0,
        averageOrderValue: parseFloat(salesResult.rows[0].average_order_value) || 0
      },
      recentOrders: recentOrdersResult.rows,
      lowStockProducts: lowStockResult.rows,
      topProducts: topProductsResult.rows,
      monthlySales: monthlySalesResult.rows
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all orders (Admin)
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    let values = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`o.status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (search) {
      whereConditions.push(`(o.email ILIKE $${paramCount} OR o.notes ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }

    const ordersResult = await db.query(
      `
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        o.updated_at,
        o.notes,
        o.email,
        o.phone,
        (SELECT COUNT(*) FROM simple_order_items WHERE order_id = o.id) as item_count
      FROM simple_orders o
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY o.updated_at DESC, o.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `,
      [...values, parseInt(limit), offset]
    );

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM simple_orders o WHERE ${whereConditions.join(' AND ')}`,
      values
    );

    const totalOrders = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders: ordersResult.rows,
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

// Get single order details (Admin)
// Mark an order as read by updating the updated_at timestamp
router.patch('/orders/:orderId/read', adminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await db.query(
      'UPDATE simple_orders SET updated_at = NOW() WHERE id = $1 RETURNING id, updated_at',
      [orderId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Order marked as read',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Mark order as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order details
router.get('/orders/:orderId', adminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Mark the order as read by updating the updated_at timestamp
    await db.query(
      'UPDATE simple_orders SET updated_at = NOW() WHERE id = $1',
      [orderId]
    );

    // Get order details
    const orderResult = await db.query(`
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.notes,
        o.created_at,
        o.updated_at,
        o.email,
        o.phone
      FROM simple_orders o
      WHERE o.id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const itemsResult = await db.query(`
      SELECT 
        oi.id,
        oi.product_id,
        oi.quantity,
        oi.product_price as price,
        oi.subtotal as total,
        oi.product_name,
        p.main_image as product_image
      FROM simple_order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);

    const order = {
      ...orderResult.rows[0],
      items: itemsResult.rows
    };

    res.json({ order });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (Admin)
router.put('/orders/:orderId/status', adminAuth, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    const result = await db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status',
      [status, orderId]
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

// Get all users (Admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    let values = [];
    let paramCount = 1;

    if (role) {
      whereConditions.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (search) {
      whereConditions.push(`(name ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }

    const result = await db.query(`
      SELECT 
        id,
        name,
        email,
        phone,
        role,
        created_at,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...values, parseInt(limit), offset]);

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM users
      WHERE ${whereConditions.join(' AND ')}
    `, values);

    const totalUsers = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user role (Admin)
router.put('/users/:userId/role', adminAuth, [
  body('role').isIn(['customer', 'admin']).withMessage('Valid role is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { role } = req.body;

    // Prevent admin from removing their own admin role
    if (parseInt(userId) === req.user.id && role === 'customer') {
      return res.status(400).json({ error: 'Cannot remove your own admin role' });
    }

    const result = await db.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get product statistics (Admin)
router.get('/products/stats', adminAuth, async (req, res) => {
  try {
    // Get product count by category
    const categoryStatsResult = await db.query(`
      SELECT 
        c.name as category_name,
        COUNT(p.id) as product_count,
        AVG(p.price) as average_price,
        SUM(p.stock) as total_stock
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY product_count DESC
    `);

    // Get low stock products
    const lowStockResult = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.stock,
        p.price,
        c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.stock <= 10
      ORDER BY p.stock ASC
    `);

    // Get top selling products
    const topSellingResult = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id, p.name, p.price
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    res.json({
      categoryStats: categoryStatsResult.rows,
      lowStockProducts: lowStockResult.rows,
      topSellingProducts: topSellingResult.rows
    });
  } catch (error) {
    console.error('Product stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create category (Admin)
router.post('/categories', adminAuth, [
  body('name').trim().isLength({ min: 2 }).withMessage('Category name must be at least 2 characters'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    // Check if category already exists
    const existingCategory = await db.query('SELECT id FROM categories WHERE name = $1', [name]);
    if (existingCategory.rows.length > 0) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const result = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    res.status(201).json({
      message: 'Category created successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update category (Admin)
router.put('/categories/:categoryId', adminAuth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Category name must be at least 2 characters'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { categoryId } = req.params;
    const { name, description } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(categoryId);
    const result = await db.query(
      `UPDATE categories SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete category (Admin)
router.delete('/categories/:categoryId', adminAuth, async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if category has products
    const productsResult = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
      [categoryId]
    );

    if (parseInt(productsResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing products. Please move or delete the products first.' 
      });
    }

    const result = await db.query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [categoryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 