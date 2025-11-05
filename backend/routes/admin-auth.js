const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// Admin login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  console.log('=== Login Request Received ===');
  console.log('Request body:', req.body);
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    console.log('Querying database for admin with email:', email);
    const adminResult = await db.query(
      'SELECT id, email, password, name FROM admins WHERE email = $1',
      [email]
    );
    console.log('Database query result:', { rowCount: adminResult.rows.length });

    if (adminResult.rows.length === 0) {
      console.log('No admin found with email:', email);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'No admin found with this email'
      });
    }

    const admin = adminResult.rows[0];
    console.log('Admin found:', { id: admin.id, email: admin.email });

    // Check password
    console.log('Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password for admin:', admin.email);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'Incorrect password'
      });
    }

    try {
      // Generate JWT token with hardcoded role since the column doesn't exist
      console.log('Generating JWT token...');
      const token = jwt.sign(
        { 
          adminId: admin.id, 
          email: admin.email,
          role: 'admin' // Hardcoded since the column doesn't exist
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      console.log('JWT token generated successfully');

      // Set HTTP-only cookie
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'lax' : 'lax', // Use 'none' if you need cross-site cookies in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        // Don't set domain for localhost - let browser handle it
        ...(isProduction && { domain: '.orbashower.com' }),
        path: '/',
      };

      console.log('Setting cookie with options:', {
        ...cookieOptions,
        token: token ? '***TOKEN_SET***' : 'NO_TOKEN'
      });

      // Set the cookie
      res.cookie('adminToken', token, cookieOptions);
      
      // Also set a response header to confirm cookie was set
      res.header('X-Set-Cookie', 'adminToken=***; Path=/; HttpOnly' + (isProduction ? '; Secure; SameSite=Lax' : ''));

      console.log('Sending successful login response');
      
      // Also include token in response for API clients
      res.json({
        success: true,
        message: 'Login successful',
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name || '',
          role: 'admin' // Hardcoded since the column doesn't exist
        }
      });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during login',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create admin (for initial setup only)
router.post('/create-admin', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if admin already exists
    const existingAdmin = await db.query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin
    const result = await db.query(
      'INSERT INTO admins (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    res.status(201).json({
      message: 'Admin created successfully',
      admin: result.rows[0]
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    // Try to get token from Authorization header first
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    // If no token in header, try to get from cookies
    if (!token && req.cookies) {
      token = req.cookies.adminToken;
    }
    
    if (!token) {
      console.log('No token found in headers or cookies');
      return res.status(401).json({ 
        error: 'No authentication token provided',
        details: 'Token is missing from both Authorization header and cookies'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if admin still exists
    const adminResult = await db.query(
      'SELECT id, email, name FROM admins WHERE id = $1',
      [decoded.adminId]
    );

    if (adminResult.rows.length === 0) {
      console.log('Admin not found for token');
      return res.status(401).json({ 
        error: 'Admin not found',
        details: 'The admin account associated with this token no longer exists'
      });
    }

    const admin = adminResult.rows[0];
    console.log('Token verified for admin:', { id: admin.id, email: admin.email });
    
    // Default role to 'admin' since the column doesn't exist in the database
    res.json({
      valid: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name || '',
        role: 'admin' // Hardcoded since the column doesn't exist
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    // More specific error messages
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        details: 'Your session has expired. Please log in again.'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        details: 'The authentication token is invalid or malformed.'
      });
    }
    
    res.status(401).json({ 
      error: 'Authentication failed',
      details: 'Failed to authenticate token'
    });
  }
});

module.exports = router;
