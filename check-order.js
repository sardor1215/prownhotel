const db = require('./backend/config/database');

async function checkOrder(orderId) {
  try {
    // Check order items
    const itemsResult = await db.query(
      'SELECT * FROM simple_order_items WHERE order_id = $1',
      [orderId]
    );
    
    console.log('Order Items:');
    console.table(itemsResult.rows);
    
    // Check order total
    const orderResult = await db.query(
      'SELECT * FROM simple_orders WHERE id = $1',
      [orderId]
    );
    
    console.log('\nOrder Details:');
    console.table(orderResult.rows);
    
  } catch (error) {
    console.error('Error checking order:', error);
  } finally {
    // Close the database connection
    await db.pool.end();
  }
}

// Get order ID from command line or use 22 as default
const orderId = process.argv[2] || 22;
checkOrder(orderId);
