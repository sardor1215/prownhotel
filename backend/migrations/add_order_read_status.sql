-- Migration to add is_read column to orders table for tracking unread orders
-- This will allow admins to see which orders are new/unread

-- Add is_read column with default value false
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Create an index for better performance when querying unread orders
CREATE INDEX IF NOT EXISTS idx_orders_is_read ON orders(is_read) 
WHERE is_read = FALSE;

-- Update existing orders to mark them as read (since they're not new)
-- This is a one-time operation for existing data
-- UPDATE orders SET is_read = TRUE WHERE is_read IS NULL;

-- Optional: Create a view for easy access to unread orders
-- CREATE OR REPLACE VIEW unread_orders AS
-- SELECT * FROM orders WHERE is_read = FALSE;

-- Optional: Create a function to mark an order as read
-- CREATE OR REPLACE FUNCTION mark_order_as_read(order_id INTEGER)
-- RETURNS VOID AS $$
-- BEGIN
--     UPDATE orders 
--     SET is_read = TRUE 
--     WHERE id = order_id;
-- END;
-- $$ LANGUAGE plpgsql;
