const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Pool } = require('pg');

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/products');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${randomString}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload multiple images for a product
router.post('/upload/:productId', upload.array('images', 5), async (req, res) => {
  const { productId } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    const client = await pool.connect();
    
    // Get current max display_order for this product
    const maxOrderResult = await client.query(
      'SELECT COALESCE(MAX(display_order), -1) as max_order FROM product_images WHERE product_id = $1',
      [productId]
    );
    let nextOrder = maxOrderResult.rows[0].max_order + 1;

    const imagePromises = files.map(async (file, index) => {
      const imageUrl = `/uploads/products/${file.filename}`;
      const isMain = nextOrder === 0; // First image is main
      
      const result = await client.query(
        'INSERT INTO product_images (product_id, image_url, is_main, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
        [productId, imageUrl, isMain, nextOrder + index]
      );
      
      return result.rows[0];
    });

    const insertedImages = await Promise.all(imagePromises);
    client.release();

    res.json({
      success: true,
      images: insertedImages
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Get all images for a product
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY display_order ASC',
      [productId]
    );
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching product images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Delete an image
router.delete('/:imageId', async (req, res) => {
  const { imageId } = req.params;

  try {
    const client = await pool.connect();
    
    // Get image info before deleting
    const imageResult = await client.query(
      'SELECT * FROM product_images WHERE id = $1',
      [imageId]
    );
    
    if (imageResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = imageResult.rows[0];
    
    // Delete from database
    await client.query('DELETE FROM product_images WHERE id = $1', [imageId]);
    
    // If this was the main image, set another image as main
    if (image.is_main) {
      await client.query(
        'UPDATE product_images SET is_main = true WHERE product_id = $1 AND id = (SELECT id FROM product_images WHERE product_id = $1 ORDER BY display_order ASC LIMIT 1)',
        [image.product_id]
      );
    }
    
    client.release();

    // Delete physical file
    try {
      const filePath = path.join(__dirname, '../uploads/products', path.basename(image.image_url));
      await fs.unlink(filePath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Set main image
router.put('/:imageId/main', async (req, res) => {
  const { imageId } = req.params;

  try {
    const client = await pool.connect();
    
    // Get the product_id for this image
    const imageResult = await client.query(
      'SELECT product_id FROM product_images WHERE id = $1',
      [imageId]
    );
    
    if (imageResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Image not found' });
    }

    const productId = imageResult.rows[0].product_id;
    
    // Remove main flag from all images of this product
    await client.query(
      'UPDATE product_images SET is_main = false WHERE product_id = $1',
      [productId]
    );
    
    // Set this image as main
    await client.query(
      'UPDATE product_images SET is_main = true WHERE id = $1',
      [imageId]
    );
    
    client.release();

    res.json({ success: true });
  } catch (error) {
    console.error('Error setting main image:', error);
    res.status(500).json({ error: 'Failed to set main image' });
  }
});

module.exports = router;
