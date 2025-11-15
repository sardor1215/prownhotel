const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { adminAuth } = require('../middleware/admin-auth');

// Apply admin authentication and JSON parsing to all routes
router.use(adminAuth);
router.use(express.json());

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

// Helper function to save menu link to file
const saveMenuLink = async (link) => {
  try {
    const menuDir = path.join(__dirname, '../uploads/menu');
    await fs.mkdir(menuDir, { recursive: true });
    const linkFile = path.join(menuDir, 'menu-link.json');
    await fs.writeFile(linkFile, JSON.stringify({ link, savedAt: Date.now() }, null, 2));
  } catch (error) {
    console.error('Error saving menu link:', error);
    throw error;
  }
};

// Helper function to delete menu link file
const deleteMenuLink = async () => {
  try {
    const menuDir = path.join(__dirname, '../uploads/menu');
    const linkFile = path.join(menuDir, 'menu-link.json');
    await fs.unlink(linkFile);
  } catch {
    // File doesn't exist, that's okay
  }
};

// Get current menu
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
          type: 'link',
          savedAt: linkData.savedAt
        }
      });
    }

    // Otherwise check for uploaded file
    const menuDir = path.join(__dirname, '../uploads/menu');
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

// Upload new menu PDF or save link
router.post('/', async (req, res) => {
  try {
    // Check if request has Content-Type application/json (link) or multipart/form-data (file)
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      // Handle link save
      const { link } = req.body;
      
      if (!link || typeof link !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Link is required'
        });
      }

      // Validate URL
      try {
        new URL(link);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format'
        });
      }

      // Delete any existing uploaded files when saving a link
      try {
        const menuDir = path.join(__dirname, '../uploads/menu');
        const files = await fs.readdir(menuDir);
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));
        await Promise.all(
          pdfFiles.map(file => fs.unlink(path.join(menuDir, file)))
        );
      } catch (error) {
        console.error('Error deleting old menu files:', error);
      }

      await saveMenuLink(link);

      res.json({
        success: true,
        message: 'Menu link saved successfully',
        menu: {
          link: link,
          url: link,
          type: 'link',
          savedAt: Date.now()
        }
      });
    } else {
      // Handle file upload
      upload.single('menu')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            error: err.message || 'File upload error'
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: 'No file uploaded'
          });
        }

        // Delete link file when uploading a file
        await deleteMenuLink();

        const menuUrl = `/uploads/menu/${req.file.filename}`;

        res.json({
          success: true,
          message: 'Menu uploaded successfully',
          menu: {
            filename: req.file.filename,
            url: menuUrl,
            type: 'file',
            size: req.file.size
          }
        });
      });
    }
  } catch (error) {
    console.error('Error processing menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process menu',
      message: error.message
    });
  }
});

// Delete current menu
router.delete('/', async (req, res) => {
  try {
    const menuDir = path.join(__dirname, '../uploads/menu');
    
    // Delete link file
    await deleteMenuLink();
    
    // Delete uploaded files
    try {
      const files = await fs.readdir(menuDir);
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      
      if (pdfFiles.length > 0) {
        await Promise.all(
          pdfFiles.map(file => 
            fs.unlink(path.join(menuDir, file))
          )
        );
      }
    } catch (error) {
      // Directory might not exist or be empty
    }

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

