const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Create new reservation
router.post('/', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const {
      guest_name,
      guest_email,
      guest_phone,
      check_in_date,
      check_out_date,
      adults = 1,
      children = 0,
      special_requests,
      rooms // Array of { room_id, quantity }
    } = req.body;

    // Validation
    if (!guest_name || !guest_email || !guest_phone || !check_in_date || !check_out_date || !rooms || rooms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        error: 'Check-in date cannot be in the past'
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        error: 'Check-out date must be after check-in date'
      });
    }

    // Calculate nights
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    await client.query('BEGIN');

    // Check room availability and get room details
    let totalAmount = 0;
    const roomDetails = [];

    for (const roomReq of rooms) {
      const { room_id } = roomReq;

      // Check if room exists and get details
      const roomResult = await client.query(
        'SELECT * FROM rooms WHERE id = $1 AND is_available = true',
        [room_id]
      );

      if (roomResult.rows.length === 0) {
        throw new Error(`Room ${room_id} not found or not available`);
      }

      const room = roomResult.rows[0];

      // Check if room is available for the requested dates
      const availabilityCheck = await client.query(`
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
      `, [room_id, check_in_date, check_out_date]);

      if (parseInt(availabilityCheck.rows[0].booking_count) > 0) {
        throw new Error(`Room ${room.name} is not available for the selected dates`);
      }

      const subtotal = parseFloat(room.price_per_night) * nights;
      totalAmount += subtotal;

      roomDetails.push({
        room_id,
        room_name: room.name,
        price_per_night: room.price_per_night,
        nights,
        subtotal
      });
    }

    // Create reservation
    const reservationResult = await client.query(`
      INSERT INTO reservations (
        guest_name, guest_email, guest_phone,
        check_in_date, check_out_date,
        adults, children,
        total_amount, special_requests, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      guest_name, guest_email, guest_phone,
      check_in_date, check_out_date,
      adults, children,
      totalAmount, special_requests, 'pending'
    ]);

    const reservation = reservationResult.rows[0];

    // Create reservation room entries
    for (const roomDetail of roomDetails) {
      await client.query(`
        INSERT INTO reservation_rooms (
          reservation_id, room_id, room_name,
          price_per_night, nights, subtotal
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        reservation.id,
        roomDetail.room_id,
        roomDetail.room_name,
        roomDetail.price_per_night,
        roomDetail.nights,
        roomDetail.subtotal
      ]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservation: {
        ...reservation,
        rooms: roomDetails
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating reservation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create reservation'
    });
  } finally {
    client.release();
  }
});

// Get all reservations (for admin)
router.get('/', async (req, res) => {
  try {
    const {
      status,
      email,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    let query = 'SELECT * FROM reservations WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (email) {
      query += ` AND guest_email ILIKE $${paramCount}`;
      queryParams.push(`%${email}%`);
      paramCount++;
    }

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered_reservations`;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Add sorting
    const allowedSortFields = ['created_at', 'check_in_date', 'check_out_date', 'total_amount'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${order}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(parseInt(limit), offset);

    const result = await db.query(query, queryParams);

    // Get rooms for each reservation
    const reservations = await Promise.all(
      result.rows.map(async (reservation) => {
        const roomsResult = await db.query(
          'SELECT * FROM reservation_rooms WHERE reservation_id = $1',
          [reservation.id]
        );
        return {
          ...reservation,
          rooms: roomsResult.rows
        };
      })
    );

    res.json({
      success: true,
      reservations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reservations',
      message: error.message
    });
  }
});

// Get single reservation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservationResult = await db.query(
      'SELECT * FROM reservations WHERE id = $1',
      [id]
    );

    if (reservationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }

    const reservation = reservationResult.rows[0];

    // Get rooms for this reservation
    const roomsResult = await db.query(
      'SELECT * FROM reservation_rooms WHERE reservation_id = $1',
      [id]
    );

    res.json({
      success: true,
      reservation: {
        ...reservation,
        rooms: roomsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reservation',
      message: error.message
    });
  }
});

// Update reservation status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const result = await db.query(
      'UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Reservation status updated',
      reservation: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update reservation status',
      message: error.message
    });
  }
});

// Delete reservation (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM reservations WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete reservation',
      message: error.message
    });
  }
});

module.exports = router;



