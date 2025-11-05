const jwt = require('jsonwebtoken');
const db = require('../config/database');

const adminAuth = async (req, res, next) => {
  try {
    // Accept token from Authorization header or cookies
    const token = req.header('Authorization')?.replace('Bearer ', '') 
      || req.cookies?.adminToken 
      || req.signedCookies?.adminToken;
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if admin exists and is active
    const adminResult = await db.query(
      'SELECT id, email, name FROM admins WHERE id = $1',
      [decoded.adminId]
    );

    if (adminResult.rows.length === 0) {
      return res.status(401).json({ error: 'Access denied. Admin not found.' });
    }

    req.admin = adminResult.rows[0];
    next();

  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ error: 'Access denied. Invalid token.' });
  }
};

module.exports = { adminAuth };
