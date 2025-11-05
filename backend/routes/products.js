const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all products with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    console.log('Products request with filters:', { category, search, page, limit });

    const offset = (page - 1) * limit;
    let whereConditions = ['1=1'];
    let values = [];
    let paramCount = 1;

    // Category filter
    if (category) {
      whereConditions.push(`c.name = $${paramCount}`);
      values.push(category);
      paramCount++;
    }

    // Search filter
    if (search) {
      whereConditions.push(`(p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }

    // Price filters
    if (minPrice) {
      whereConditions.push(`p.price >= $${paramCount}`);
      values.push(minPrice);
      paramCount++;
    }

    if (maxPrice) {
      whereConditions.push(`p.price <= $${paramCount}`);
      values.push(maxPrice);
      paramCount++;
    }

    // Validate sort parameters
    const allowedSortFields = ['name', 'price', 'created_at', 'rating'];
    const allowedSortOrders = ['ASC', 'DESC'];
    
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = allowedSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Get products with category info
    const productsQuery = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY p.${sortField} ${sortDirection}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    console.log('Executing query:', productsQuery);
    console.log('With values:', [...values, parseInt(limit), offset]);

    values.push(parseInt(limit), offset);
    const productsResult = await db.query(productsQuery, values);

    console.log('Query result:', productsResult.rows.length, 'products found');

    // Get images for each product (handle schema variations and table absence)
    const productIds = productsResult.rows.map(p => p.id);
    let imagesResult = { rows: [] };
    
    if (productIds.length > 0) {
      try {
        // First attempt: columns as defined in migration (display_order, is_main)
        const imagesQueryV1 = `
          SELECT 
            product_id, 
            image_url, 
            is_main, 
            COALESCE(display_order, 0) AS sort_order
          FROM product_images 
          WHERE product_id = ANY($1)
          ORDER BY product_id, COALESCE(display_order, 0) ASC
        `;
        imagesResult = await db.query(imagesQueryV1, [productIds]);
      } catch (error) {
        console.log('product_images query (v1) failed, attempting compatibility query:', error.message);
        try {
          // Fallback attempt: columns as defined in create-tables-direct (sort_order, no is_main)
          const imagesQueryV2 = `
            SELECT 
              product_id, 
              image_url, 
              NULL::boolean AS is_main,
              COALESCE(sort_order, 0) AS sort_order
            FROM product_images 
            WHERE product_id = ANY($1)
            ORDER BY product_id, COALESCE(sort_order, 0) ASC
          `;
          imagesResult = await db.query(imagesQueryV2, [productIds]);
        } catch (error2) {
          console.log('product_images table not available or incompatible, using main_image field only');
          // If product_images table doesn't exist or incompatible, we'll just use main_image
        }
      }
    }

    // Group images by product_id
    const imagesByProduct = {};
    imagesResult.rows.forEach(img => {
      if (!imagesByProduct[img.product_id]) {
        imagesByProduct[img.product_id] = [];
      }
      imagesByProduct[img.product_id].push(img);
    });

    // Add images to products and set main_image for backward compatibility
    const productsWithImages = productsResult.rows.map(product => {
      const images = imagesByProduct[product.id] || [];
      const mainImage = images.find(img => img.is_main) || images[0];
      
      // If no images from product_images table, use the main_image and images from products table
      if (images.length === 0 && (product.main_image || (product.images && product.images.length > 0))) {
        const productImages = product.images || [];
        const formattedImages = productImages.map((imgUrl, index) => ({
          image_url: imgUrl,
          is_main: index === 0,
          sort_order: index
        }));
        
        return {
          ...product,
          images: formattedImages,
          main_image: product.main_image || productImages[0] || null
        };
      }
      
      return {
        ...product,
        images: images,
        main_image: mainImage ? mainImage.image_url : product.main_image || null
      };
    });

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countResult = await db.query(countQuery, values.slice(0, -2));

    const totalProducts = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products: productsWithImages,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        p.*,
        c.name as category_name,
        0 as average_rating,
        0 as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get product images (handle schema variations)
    let imagesResult = { rows: [] };
    try {
      // First attempt: try with sort_order (your current schema)
      const imagesQuery = `
        SELECT 
          id, 
          image_url, 
          alt_text,
          COALESCE(sort_order, 0) AS sort_order
        FROM product_images 
        WHERE product_id = $1 
        ORDER BY COALESCE(sort_order, 0)
      `;
      imagesResult = await db.query(imagesQuery, [id]);
    } catch (error) {
      console.log('product_images query failed, using empty result:', error.message);
      // If the table doesn't exist or has different schema, we'll use empty result
    }

    // Get related products
    const relatedResult = await db.query(`
      SELECT id, name, price, main_image, 0 as average_rating
      FROM products 
      WHERE category_id = $1 AND id != $2 
      LIMIT 4
    `, [result.rows[0].category_id, id]);

    const product = {
      ...result.rows[0],
      images: imagesResult.rows,
      related_products: relatedResult.rows
    };

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new product (Admin only)
router.post('/', adminAuth, upload.array('images', 5), [
  body('name').trim().isLength({ min: 3 }).withMessage('Product name must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category_id, stock, dimensions, material, features } = req.body;

    // Check if category exists
    const categoryResult = await db.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: 'Category not found' });
    }

    // Create product
    const productResult = await db.query(`
      INSERT INTO products (name, description, price, category_id, stock, dimensions, material, features, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, name, price, main_image
    `, [name, description, price, category_id, stock, dimensions, material, features, req.user.id]);

    const product = productResult.rows[0];

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imageValues = req.files.map((file, index) => {
        const isMain = index === 0; // First image is main
        return `($1, $${index + 2}, $${index + 3}, $${index + 4})`;
      }).join(', ');

      const imageParams = [product.id];
      req.files.forEach((file, index) => {
        imageParams.push(`/uploads/products/${file.filename}`);
        imageParams.push(`Image ${index + 1} for ${name}`);
        imageParams.push(index);
      });

      await db.query(`
        INSERT INTO product_images (product_id, image_url, alt_text, sort_order)
        VALUES ${imageValues}
      `, imageParams);

      // Update main image
      await db.query(
        'UPDATE products SET main_image = $1 WHERE id = $2',
        [`/uploads/products/${req.files[0].filename}`, product.id]
      );
    }

    res.status(201).json({
      message: 'Product created successfully',
      product: {
        ...product,
        main_image: req.files && req.files.length > 0 ? `/uploads/products/${req.files[0].filename}` : null
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product (Admin only)
router.put('/:id', adminAuth, upload.array('images', 5), [
  body('name').optional().trim().isLength({ min: 3 }).withMessage('Product name must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    // Build update query dynamically
    ['name', 'description', 'price', 'category_id', 'stock', 'dimensions', 'material', 'features'].forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(req.body[field]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await db.query(
      `UPDATE products SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const imageValues = req.files.map((file, index) => {
        return `($1, $${index + 2}, $${index + 3}, $${index + 4})`;
      }).join(', ');

      const imageParams = [id];
      req.files.forEach((file, index) => {
        imageParams.push(`/uploads/products/${file.filename}`);
        imageParams.push(`Image ${index + 1} for ${result.rows[0].name}`);
        imageParams.push(index);
      });

      await db.query(`
        INSERT INTO product_images (product_id, image_url, alt_text, sort_order)
        VALUES ${imageValues}
      `, imageParams);
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

// Delete product (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT name FROM categories ORDER BY name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get categories with product counts
router.get('/categories/all', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name
    `);

    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 