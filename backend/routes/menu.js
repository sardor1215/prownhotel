const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Get current menu (public route)
router.get('/', async (req, res) => {
  try {
    const menuDir = path.join(__dirname, '../uploads/menu');
    
    // Check if directory exists
    try {
      await fs.access(menuDir);
    } catch {
      return res.json({
        success: true,
        menu: null,
        message: 'No menu uploaded yet'
      });
    }

    const files = await fs.readdir(menuDir);
    
    // Find the most recent menu PDF
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      return res.json({
        success: true,
        menu: null,
        message: 'No menu uploaded yet'
      });
    }

    // Sort by filename (which includes timestamp) to get the latest
    pdfFiles.sort().reverse();
    const latestMenu = pdfFiles[0];
    const menuUrl = `/uploads/menu/${latestMenu}`;

    res.json({
      success: true,
      menu: {
        filename: latestMenu,
        url: menuUrl,
        uploadedAt: latestMenu.match(/menu-(\d+)-/)?.[1] || null
      }
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu',
      message: error.message
    });
  }
});

module.exports = router;

