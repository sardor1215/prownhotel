-- Migration to add support for multiple product images
-- Run this after your existing product table is created

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_main ON product_images(product_id, is_main);

-- Update existing products table to remove main_image column if it exists
-- (We'll handle this in the backend to maintain backward compatibility)

-- Insert some sample images for existing products (optional)
-- You can run this after adding some products
/*
INSERT INTO product_images (product_id, image_url, is_main, display_order) VALUES
(1, '/uploads/products/sample-shower-1.jpg', true, 0),
(1, '/uploads/products/sample-shower-1-alt.jpg', false, 1),
(2, '/uploads/products/sample-shower-2.jpg', true, 0),
(3, '/uploads/products/sample-shower-3.jpg', true, 0);
*/
