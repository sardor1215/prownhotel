const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all rooms with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      room_type,
      min_price,
      max_price,
      adults,
      children,
      check_in,
      check_out,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    let query = `
      SELECT 
        r.*,
        rt.name as room_type_name,
        rt.slug as room_type_slug
      FROM rooms r
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.is_available = true
    `;
    const queryParams = [];
    let paramCount = 1;

    // Filter by room type
    if (room_type) {
      query += ` AND rt.slug = $${paramCount}`;
      queryParams.push(room_type);
      paramCount++;
    }

    // Filter by price range
    if (min_price) {
      query += ` AND r.price_per_night >= $${paramCount}`;
      queryParams.push(parseFloat(min_price));
      paramCount++;
    }

    if (max_price) {
      query += ` AND r.price_per_night <= $${paramCount}`;
      queryParams.push(parseFloat(max_price));
      paramCount++;
    }

    // Filter by capacity
    if (adults) {
      query += ` AND r.max_adults >= $${paramCount}`;
      queryParams.push(parseInt(adults));
      paramCount++;
    }

    if (children) {
      query += ` AND r.max_children >= $${paramCount}`;
      queryParams.push(parseInt(children));
      paramCount++;
    }

    // Check availability for specific dates
    if (check_in && check_out) {
      query += ` AND r.id NOT IN (
        SELECT DISTINCT rr.room_id 
        FROM reservation_rooms rr
        JOIN reservations res ON rr.reservation_id = res.id
        WHERE res.status != 'cancelled'
        AND (
          (res.check_in_date <= $${paramCount} AND res.check_out_date > $${paramCount})
          OR (res.check_in_date < $${paramCount + 1} AND res.check_out_date >= $${paramCount + 1})
          OR (res.check_in_date >= $${paramCount} AND res.check_out_date <= $${paramCount + 1})
        )
      )`;
      queryParams.push(check_in, check_out);
      paramCount += 2;
    }

    // Count total for pagination
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered_rooms`;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Add sorting - prioritize display_order if it exists, then by specified sort field
    const allowedSortFields = ['price_per_night', 'created_at', 'name'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Check if display_order column exists
    let orderByClause = `ORDER BY r.${sortField} ${order}`
    try {
      const checkColumn = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'rooms' AND column_name = 'display_order'
      `)
      if (checkColumn.rows.length > 0) {
        orderByClause = `ORDER BY COALESCE(r.display_order, 999999) ASC, r.${sortField} ${order}`
      }
    } catch (error) {
      // If check fails, just use default ordering
      console.log('Display order column check failed, using default ordering')
    }
    query += ` ${orderByClause}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(parseInt(limit), offset);

    const result = await db.query(query, queryParams);

    res.json({
      success: true,
      rooms: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
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

// Get single room by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT 
        r.*,
        rt.name as room_type_name,
        rt.slug as room_type_slug,
        rt.description as room_type_description
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

// Get room availability for date range
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out } = req.query;

    if (!check_in || !check_out) {
      return res.status(400).json({
        success: false,
        error: 'Check-in and check-out dates are required'
      });
    }

    const result = await db.query(`
      SELECT COUNT(*) as booking_count
      FROM reservation_rooms rr
      JOIN reservations res ON rr.reservation_id = res.id
      WHERE rr.room_id = $1
      AND res.status != 'cancelled'
      AND (
        (res.check_in_date <= $2 AND res.check_out_date > $2)
        OR (res.check_in_date < $3 AND res.check_out_date >= $3)
        OR (res.check_in_date >= $2 AND res.check_out_date <= $3)
      )
    `, [id, check_in, check_out]);

    const isAvailable = parseInt(result.rows[0].booking_count) === 0;

    res.json({
      success: true,
      available: isAvailable
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check availability',
      message: error.message
    });
  }
});

// Get all room types
router.get('/types/all', async (req, res) => {
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

module.exports = router;



