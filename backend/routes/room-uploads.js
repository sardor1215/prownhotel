const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { adminAuth } = require('../middleware/admin-auth');

const router = express.Router();

// Configure multer for room image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/rooms');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename: room-{timestamp}-{random}.{ext}
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'room-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed! (jpeg, jpg, png, gif, webp)'), false);
    }
  }
});

// Upload single image (admin only)
router.post('/single', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    const imageUrl = `/uploads/rooms/${req.file.filename}`;
    
    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to upload image',
      message: error.message 
    });
  }
});

// Upload multiple images (admin only)
router.post('/multiple', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No files uploaded' 
      });
    }

    const uploadedFiles = req.files.map(file => ({
      url: `/uploads/rooms/${file.filename}`,
      filename: file.filename,
      size: file.size
    }));
    
    res.json({
      success: true,
      files: uploadedFiles,
      count: uploadedFiles.length
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to upload images',
      message: error.message 
    });
  }
});

module.exports = router;



