const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all room types (public route)
router.get('/', async (req, res) => {
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

// Get single room type by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT * FROM room_types
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Room type not found'
      });
    }

    res.json({
      success: true,
      roomType: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching room type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room type',
      message: error.message
    });
  }
});

module.exports = router;


