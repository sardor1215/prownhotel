const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/admin-auth');

// Apply admin authentication to all routes
router.use(adminAuth);

// Get all rooms (admin view)
router.get('/', async (req, res) => {
  try {
    // Check if display_order column exists, if not, just order by created_at
    let orderByClause = 'ORDER BY r.created_at DESC'
    try {
      // Try to use display_order if it exists
      const checkColumn = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'rooms' AND column_name = 'display_order'
      `)
      if (checkColumn.rows.length > 0) {
        orderByClause = 'ORDER BY COALESCE(r.display_order, 999999) ASC, r.created_at DESC'
      }
    } catch (error) {
      // If check fails, just use default ordering
      console.log('Display order column check failed, using default ordering')
    }

    const result = await db.query(`
      SELECT 
        r.*,
        rt.name as room_type_name,
        rt.slug as room_type_slug
      FROM rooms r
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      ${orderByClause}
    `);

    // Log sample room data for debugging
    if (result.rows.length > 0) {
      console.log('📸 Sample room data:', {
        id: result.rows[0].id,
        name: result.rows[0].name,
        main_image: result.rows[0].main_image,
        images: result.rows[0].images,
        main_image_type: typeof result.rows[0].main_image
      });
    }

    res.json({
      success: true,
      rooms: result.rows
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rooms',
      message: error.message
    });
  }
});

// Create new room
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      price_per_night,
      room_type_id,
      main_image,
      images = [],
      max_adults = 2,
      max_children = 0,
      size_sqm,
      amenities = {},
      is_available = true,
      display_order = 0
    } = req.body;

    // Validation
    if (!name || !price_per_night || !room_type_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, price_per_night, room_type_id'
      });
    }

    // Check if display_order column exists before including it in INSERT
    let insertColumns = 'name, description, price_per_night, room_type_id, main_image, images, max_adults, max_children, size_sqm, amenities, is_available'
    let insertValues = '$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11'
    let insertParams = [name, description, price_per_night, room_type_id, main_image, images, max_adults, max_children, size_sqm, JSON.stringify(amenities), is_available]
    
    try {
      const checkColumn = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'rooms' AND column_name = 'display_order'
      `)
      if (checkColumn.rows.length > 0) {
        insertColumns += ', display_order'
        insertValues += ', $12'
        insertParams.push(display_order)
      }
    } catch (error) {
      console.log('Display order column check failed, creating room without display_order')
    }

    const result = await db.query(`
      INSERT INTO rooms (${insertColumns})
      VALUES (${insertValues})
      RETURNING *
    `, insertParams);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create room',
      message: error.message
    });
  }
});

// Get single room by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        r.*,
        rt.name as room_type_name,
        rt.slug as room_type_slug
      FROM rooms r
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.json({
      success: true,
      room: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room',
      message: error.message
    });
  }
});

// Update room
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price_per_night,
      room_type_id,
      main_image,
      images,
      max_adults,
      max_children,
      size_sqm,
      amenities,
      is_available,
      display_order
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (price_per_night !== undefined) {
      updates.push(`price_per_night = $${paramCount}`);
      values.push(price_per_night);
      paramCount++;
    }
    if (room_type_id !== undefined) {
      updates.push(`room_type_id = $${paramCount}`);
      values.push(room_type_id);
      paramCount++;
    }
    if (main_image !== undefined) {
      updates.push(`main_image = $${paramCount}`);
      values.push(main_image);
      paramCount++;
    }
    if (images !== undefined) {
      updates.push(`images = $${paramCount}`);
      values.push(images);
      paramCount++;
    }
    if (max_adults !== undefined) {
      updates.push(`max_adults = $${paramCount}`);
      values.push(max_adults);
      paramCount++;
    }
    if (max_children !== undefined) {
      updates.push(`max_children = $${paramCount}`);
      values.push(max_children);
      paramCount++;
    }
    if (size_sqm !== undefined) {
      updates.push(`size_sqm = $${paramCount}`);
      values.push(size_sqm);
      paramCount++;
    }
    if (amenities !== undefined) {
      updates.push(`amenities = $${paramCount}`);
      values.push(JSON.stringify(amenities));
      paramCount++;
    }
    if (is_available !== undefined) {
      updates.push(`is_available = $${paramCount}`);
      values.push(is_available);
      paramCount++;
    }
    // Only add display_order update if column exists
    let displayOrderColumnExists = false
    if (display_order !== undefined) {
      try {
        const checkColumn = await db.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'rooms' AND column_name = 'display_order'
        `)
        if (checkColumn.rows.length > 0) {
          displayOrderColumnExists = true
          updates.push(`display_order = $${paramCount}`);
          values.push(display_order);
          paramCount++;
        } else {
          console.log('⚠️ display_order column does not exist yet')
        }
      } catch (error) {
        console.log('Display order column check failed, skipping display_order update')
      }
    }

    if (updates.length === 0) {
      // If only display_order was sent but column doesn't exist, return helpful error
      if (display_order !== undefined && !displayOrderColumnExists) {
        return res.status(400).json({
          success: false,
          error: 'Display order feature not enabled. Please run the database migration first.',
          hint: 'Run the SQL script: backend/scripts/add-display-order-to-rooms.sql'
        });
      }
      
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE rooms
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room updated successfully',
      room: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update room',
      message: error.message
    });
  }
});

// Delete room
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if room has any active reservations
    const reservationCheck = await db.query(`
      SELECT COUNT(*) as count
      FROM reservation_rooms rr
      JOIN reservations res ON rr.reservation_id = res.id
      WHERE rr.room_id = $1
      AND res.status IN ('pending', 'confirmed')
      AND res.check_out_date >= CURRENT_DATE
    `, [id]);

    if (parseInt(reservationCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete room with active or upcoming reservations'
      });
    }

    const result = await db.query(
      'DELETE FROM rooms WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete room',
      message: error.message
    });
  }
});

// Get room types
router.get('/types', async (req, res) => {
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
router.post('/types', async (req, res) => {
  try {
    const { name, slug, description, max_adults, max_children } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: 'Name and slug are required'
      });
    }

    const result = await db.query(`
      INSERT INTO room_types (name, slug, description, max_adults, max_children)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, slug, description, max_adults || 2, max_children || 0]);

    res.status(201).json({
      success: true,
      message: 'Room type created successfully',
      roomType: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating room type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create room type',
      message: error.message
    });
  }
});

// Update room type
router.put('/types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, max_adults, max_children } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramCount}`);
      values.push(slug);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (max_adults !== undefined) {
      updates.push(`max_adults = $${paramCount}`);
      values.push(max_adults);
      paramCount++;
    }
    if (max_children !== undefined) {
      updates.push(`max_children = $${paramCount}`);
      values.push(max_children);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE room_types
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

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
    res.status(500).json({
      success: false,
      error: 'Failed to update room type',
      message: error.message
    });
  }
});

// Delete room type
router.delete('/types/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any rooms use this type
    const roomCheck = await db.query(
      'SELECT COUNT(*) as count FROM rooms WHERE room_type_id = $1',
      [id]
    );

    if (parseInt(roomCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete room type that is being used by rooms'
      });
    }

    const result = await db.query(
      'DELETE FROM room_types WHERE id = $1 RETURNING *',
      [id]
    );

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



