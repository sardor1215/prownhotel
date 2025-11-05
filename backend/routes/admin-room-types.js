const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/admin-auth');

// Apply admin authentication to all routes
router.use(adminAuth);

// Get all room types
router.get('/', async (req, res) => {
  console.log('🔵 GET /api/admin/room-types called');
  try {
    const result = await db.query(`
      SELECT * FROM room_types
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      roomTypes: result.rows
    });
  } catch (error) {
    console.error('Error fetching room types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room types',
      message: error.message
    });
  }
});

// Create room type
router.post('/', async (req, res) => {
  try {
    const { name, description, max_adults, max_children } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const result = await db.query(`
      INSERT INTO room_types (name, slug, description, max_adults, max_children)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, slug, description || null, max_adults || 2, max_children || 0]);

    res.status(201).json({
      success: true,
      message: 'Room type created successfully',
      roomType: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating room type:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'A room type with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create room type',
      message: error.message
    });
  }
});

// Update room type
router.put('/:id', async (req, res) => {
  console.log('🔵 PUT /api/admin/room-types/:id called', { id: req.params.id, body: req.body });
  try {
    const { id } = req.params;
    const { name, description, max_adults, max_children } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const result = await db.query(`
      UPDATE room_types
      SET 
        name = $1,
        slug = $2,
        description = $3,
        max_adults = $4,
        max_children = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [name, slug, description || null, max_adults || 2, max_children || 0, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Room type not found'
      });
    }

    res.json({
      success: true,
      message: 'Room type updated successfully',
      roomType: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating room type:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'A room type with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update room type',
      message: error.message
    });
  }
});

// Delete room type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any rooms are using this room type
    const roomCheck = await db.query(`
      SELECT COUNT(*) as count FROM rooms WHERE room_type_id = $1
    `, [id]);

    if (parseInt(roomCheck.rows[0].count) > 0) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete room type because it is assigned to rooms. Please reassign or delete those rooms first.'
      });
    }

    const result = await db.query(`
      DELETE FROM room_types WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Room type not found'
      });
    }

    res.json({
      success: true,
      message: 'Room type deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete room type',
      message: error.message
    });
  }
});

module.exports = router;


