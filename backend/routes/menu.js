const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Helper function to get menu link from file
const getMenuLink = async () => {
  try {
    const menuDir = path.join(__dirname, '../uploads/menu');
    const linkFile = path.join(menuDir, 'menu-link.json');
    const data = await fs.readFile(linkFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// Get current menu (public route)
router.get('/', async (req, res) => {
  try {
    // First check for link
    const linkData = await getMenuLink();
    if (linkData && linkData.link) {
      return res.json({
        success: true,
        menu: {
          link: linkData.link,
          url: linkData.link,
          type: 'link'
        }
      });
    }

    // Otherwise check for uploaded file
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
    const pdfFiles = files.filter(file => file.endsWith('.pdf') && file !== 'menu-link.json');
    
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
        type: 'file',
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

