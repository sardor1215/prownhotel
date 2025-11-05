const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { adminAuth } = require('../middleware/admin-auth');

// Apply admin authentication to all routes
router.use(adminAuth);

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/menu');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    cb(null, `menu-${timestamp}-${randomString}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Get current menu
router.get('/', async (req, res) => {
  try {
    const menuDir = path.join(__dirname, '../uploads/menu');
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

// Upload new menu PDF
router.post('/', upload.single('menu'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const menuUrl = `/uploads/menu/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Menu uploaded successfully',
      menu: {
        filename: req.file.filename,
        url: menuUrl,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload menu',
      message: error.message
    });
  }
});

// Delete current menu
router.delete('/', async (req, res) => {
  try {
    const menuDir = path.join(__dirname, '../uploads/menu');
    const files = await fs.readdir(menuDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No menu found to delete'
      });
    }

    // Delete all menu files
    await Promise.all(
      pdfFiles.map(file => 
        fs.unlink(path.join(menuDir, file))
      )
    );

    res.json({
      success: true,
      message: 'Menu deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete menu',
      message: error.message
    });
  }
});

module.exports = router;

