const db = require('./backend/config/database');

async function updateOrderPrices(orderId) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Get all order items for this order
    const itemsResult = await client.query(
      'SELECT * FROM simple_order_items WHERE order_id = $1',
      [orderId]
    );

    console.log(`Found ${itemsResult.rows.length} items for order ${orderId}`);

    // Update each item with the correct price from the products table
    for (const item of itemsResult.rows) {
      // Get the current product price
      const productResult = await client.query(
        'SELECT price FROM products WHERE id = $1',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        console.warn(`Product ${item.product_id} not found, skipping`);
        continue;
      }

      const productPrice = parseFloat(productResult.rows[0].price);
      const subtotal = productPrice * item.quantity;

      console.log(`Updating item ${item.id} (product ${item.product_id}):`);
      console.log(`  Old price: ${item.product_price}, New price: ${productPrice}`);
      console.log(`  Old subtotal: ${item.subtotal}, New subtotal: ${subtotal}`);

      // Update the order item
      await client.query(
        'UPDATE simple_order_items SET product_price = $1, subtotal = $2 WHERE id = $3',
        [productPrice, subtotal, item.id]
      );
    }

    // Recalculate order total
    const totalResult = await client.query(
      'SELECT COALESCE(SUM(subtotal), 0) as total FROM simple_order_items WHERE order_id = $1',
      [orderId]
    );

    const newTotal = parseFloat(totalResult.rows[0].total);
    console.log(`Updating order total to: ${newTotal}`);

    // Update the order total
    await client.query(
      'UPDATE simple_orders SET total_amount = $1 WHERE id = $2',
      [newTotal, orderId]
    );

    await client.query('COMMIT');
    console.log('Order prices updated successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating order prices:', error);
    throw error;
  } finally {
    client.release();
    await db.pool.end();
  }
}

// Get order ID from command line or use 22 as default
const orderId = process.argv[2] || 22;
updateOrderPrices(orderId).catch(console.error);
