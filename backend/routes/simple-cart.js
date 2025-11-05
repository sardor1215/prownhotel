const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'orbashowerecommerce@gmail.com',
      pass: 'txln rzas gdbr jezq'
    }
  });
};

// Get all products
router.get('/products', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id,
        name,
        description,
        price,
        main_image,
        category,
        specifications
      FROM products 
      ORDER BY created_at DESC
    `);

    res.json({
      products: result.rows
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT 
        id,
        name,
        description,
        price,
        main_image,
        images,
        stock,
        category,
        specifications
      FROM products 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit order (simplified - no authentication required)
router.post('/submit-order', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, phone, items, notes } = req.body;

    // Validate products and calculate total
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      // Verify product exists but use the price from the frontend
      const product = await db.query(
        'SELECT id, name FROM products WHERE id = $1',
        [item.product_id]
      );

      if (product.rows.length === 0) {
        return res.status(400).json({
          error: `Product with ID ${item.product_id} not found`
        });
      }

      // Use the price provided by the frontend
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = parseInt(item.quantity, 10) || 0;
      const itemTotal = itemPrice * itemQuantity;
      total += itemTotal;

      validatedItems.push({
        product_id: product.rows[0].id,
        product_name: item.product_name || product.rows[0].name,
        price: itemPrice,
        quantity: itemQuantity,
        total: itemTotal
      });
    }

    // Start transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Create order
      const orderResult = await client.query(`
        INSERT INTO simple_orders (email, phone, total_amount, notes, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [email, phone, total, notes || '', 'pending']);

      const orderId = orderResult.rows[0].id;

      // Insert order items
      for (const item of validatedItems) {
        await client.query(`
          INSERT INTO simple_order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [orderId, item.product_id, item.product_name, item.price, item.quantity, item.total]);
      }

      await client.query('COMMIT');

      // Send email notification to admin
      try {
        await sendAdminNotification(orderId, email, phone, validatedItems, total, notes);
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
        // Don't fail the order if email fails
      }

      res.status(201).json({
        message: 'Order submitted successfully',
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
    console.error('Submit order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send admin notification email
async function sendAdminNotification(orderId, customerEmail, customerPhone, items, total, notes) {
  console.log('🔄 Starting to send email notification...');
  console.log('📧 Email details:', {
    to: 'sardorbtc@gmail.com',
    from: 'Orba Shower E-commerce <orbashowerecommerce@gmail.com>',
    customerEmail,
    customerPhone,
    orderId,
    itemCount: items.length,
    total
  });
  
  try {
    const transporter = createTransporter();
    console.log('✅ SMTP Transporter created successfully');
    
    // Ensure prices are numbers before formatting
    const itemsHtml = items.map(item => {
      const price = Number(item.price) || 0;
      const itemTotal = Number(item.total) || 0;
      return `
      <tr>
        <td>${item.product_name}</td>
        <td>${item.quantity}</td>
        <td>₺${price.toFixed(2)}</td>
        <td>₺${itemTotal.toFixed(2)}</td>
      </tr>
    `}).join('');

    const emailHtml = `
      <h2>New Order Received - #${orderId}</h2>
      
      <h3>Customer Information:</h3>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>
      
      <h3>Order Details:</h3>
      <table border="1" cellpadding="10" cellspacing="0">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3"><strong>Total Amount:</strong></td>
            <td><strong>₺${total.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      ${notes ? `<h3>Customer Notes:</h3><p>${notes}</p>` : ''}
      
      <p><em>Please contact the customer to confirm the order and arrange delivery.</em></p>
    `;

    const mailOptions = {
      from: 'Orba Shower E-commerce <orbashowerecommerce@gmail.com>',
      to: 'sardorbtc@gmail.com',
      subject: `New Order #${orderId}`,
      html: emailHtml,
      replyTo: customerEmail
    };

    console.log('✉️ Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      replyTo: mailOptions.replyTo,
      htmlLength: mailOptions.html.length
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!', {
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error; // Re-throw to be handled by the caller
  }
}

// Get order status (for customer to check)
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderResult = await db.query(`
      SELECT 
        id,
        email,
        phone,
        total_amount,
        status,
        notes,
        created_at
      FROM simple_orders 
      WHERE id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await db.query(`
      SELECT 
        product_name,
        price,
        quantity,
        total
      FROM simple_order_items 
      WHERE order_id = $1
    `, [orderId]);

    res.json({
      order: {
        ...order,
        items: itemsResult.rows
      }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
