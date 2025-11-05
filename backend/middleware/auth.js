const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const result = await db.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    // Try to get token from Authorization header or cookie
    let token = req.header('Authorization')?.replace('Bearer ', '') || 
               req.cookies?.adminToken ||
               req.signedCookies?.adminToken;
    
    if (!token) {
      // If no token and this is a browser request, redirect to login
      if (req.accepts('html')) {
        return res.redirect(`/admin/login?from=${encodeURIComponent(req.originalUrl)}`);
      }
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if this is an admin token
    if (!decoded.adminId) {
      if (req.accepts('html')) {
        return res.redirect('/admin/login?error=invalid_token');
      }
      return res.status(403).json({ error: 'Access denied. Invalid admin token.' });
    }

    // Get admin from database
    const result = await db.query(
      'SELECT id, email, name, role FROM admins WHERE id = $1',
      [decoded.adminId]
    );

    if (result.rows.length === 0) {
      if (req.accepts('html')) {
        return res.redirect('/admin/login?error=admin_not_found');
      }
      return res.status(403).json({ error: 'Access denied. Admin not found.' });
    }

    // Check if admin has the required role
    const admin = result.rows[0];
    if (admin.role !== 'admin') {
      if (req.accepts('html')) {
        return res.redirect('/admin/login?error=insufficient_permissions');
      }
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    
    // Clear invalid token
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.orbashower.com' : undefined
    });
    
    if (req.accepts('html')) {
      return res.redirect(`/admin/login?error=auth_error&from=${encodeURIComponent(req.originalUrl)}`);
    }
    
    res.status(401).json({ 
      error: 'Please authenticate as admin.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { auth, adminAuth };