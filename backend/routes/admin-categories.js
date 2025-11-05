const express = require('express')
const router = express.Router()
const { Pool } = require('pg')

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Get all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC')
    res.json({ categories: result.rows })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Create a new category
router.post('/', async (req, res) => {
  const { name, slug, description = '' } = req.body
  
  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, description]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating category:', error)
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'A category with this name or slug already exists' })
    }
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// Update a category
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { name, slug, description } = req.body
  
  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required' })
  }

  try {
    const result = await pool.query(
      'UPDATE categories SET name = $1, slug = $2, description = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, slug, description, id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating category:', error)
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'A category with this name or slug already exists' })
    }
    res.status(500).json({ error: 'Failed to update category' })
  }
})

// Delete a category
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    // First, check if there are any products in this category
    const productsResult = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id])
    const productCount = parseInt(productsResult.rows[0].count)
    
    if (productCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category with ${productCount} product(s). Please reassign or delete the products first.` 
      })
    }

    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

// Get a single category by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching category:', error)
    res.status(500).json({ error: 'Failed to fetch category' })
  }
})

module.exports = router
