const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Database connection
const db = require("./config/database");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const simpleCartRoutes = require("./routes/simple-cart");
const adminAuthRoutes = require("./routes/admin-auth");
const adminProductRoutes = require("./routes/admin-products");
const adminAnalyticsRoutes = require("./routes/admin-analytics");
const adminCategoriesRoutes = require("./routes/admin-categories");
const productImagesRoutes = require("./routes/productImages");
const uploadRoutes = require("./routes/upload");

// Hotel-specific routes
const roomsRoutes = require("./routes/rooms");
const reservationsRoutes = require("./routes/reservations");
const roomTypesRoutes = require("./routes/room-types");
const menuRoutes = require("./routes/menu");
const adminRoomsRoutes = require("./routes/admin-rooms");
const adminRoomTypesRoutes = require("./routes/admin-room-types");
const adminMenuRoutes = require("./routes/admin-menu");

const app = express();
// Backend runs on port 5002 internally (nginx on 5001 proxies to this)
const PORT = process.env.PORT || 5002;

// Trust first proxy (important when behind load balancers like Nginx or when using rate limiting)
app.set("trust proxy", 1);

// Security middleware - configure Helmet for API server
// Note: CSP is primarily for frontend pages, so we disable it for API server
// or make it very permissive to allow all connections
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API server (it's for frontend pages)
  crossOriginEmbedderPolicy: false, // Allow cross-origin images
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resource loading
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Configure CORS
// const allowedOrigins = [
//   'http://localhost:3000',
//   'https://orbashower.com',
//   'https://www.orbashower.com',
//   /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/
// ];
// CORS configuration - Allow all origins
const configureCors = (req, res, next) => {
  const origin = req.headers.origin;

  // Allow all origins
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    // If no origin header, allow all
    res.header("Access-Control-Allow-Origin", "*");
  }
  
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Range, Accept, Origin"
  );
  res.header(
    "Access-Control-Expose-Headers",
    "Content-Range, X-Content-Range, Content-Length, Content-Type, X-Total-Count"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Max-Age", "86400");
    return res.status(204).end();
  }

  next();
};

// Parse cookies
app.use(cookieParser());

// Apply CORS middleware
app.use(configureCors);

// Logging
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Configure CORS middleware - Allow all origins
app.use((req, res, next) => {
  // Allow all origins
  const origin = req.headers.origin;
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }
  
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Range"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Expose-Headers", "Content-Range, X-Content-Range, Content-Length, Content-Type, X-Total-Count");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Configure static file serving with security headers
const staticOptions = {
  setHeaders: (res, path) => {
    // Set CORS headers for static files
    const origin = res.req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Range"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Range"
    );

    // Set security headers for static files
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // Cache control for static files (1 year for immutable assets)
    const isImmutable = /\.[a-f0-9]{8,}\./.test(path);
    if (isImmutable) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      res.setHeader("Cache-Control", "public, max-age=86400");
    }

    // Set proper content type based on file extension
    const ext = path.split(".").pop().toLowerCase();
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      svg: "image/svg+xml",
      webp: "image/webp",
      ico: "image/x-icon",
      css: "text/css",
      js: "application/javascript",
      json: "application/json",
      html: "text/html",
      txt: "text/plain",
    };

    if (mimeTypes[ext]) {
      res.setHeader("Content-Type", mimeTypes[ext]);
    } else {
      // For unknown file types, let Express handle it
      res.removeHeader("Content-Type");
    }
  },
};

// Serve static files from uploads directory with CORS and security headers
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("Created uploads directory:", uploadsPath);
}

// Log the absolute path to uploads directory for debugging
console.log("Serving static files from:", uploadsPath);

// Configure CORS for static files - Allow all origins
const staticCorsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ["GET", "HEAD", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Range", "Origin"],
  exposedHeaders: ["Content-Length", "Content-Range", "Content-Type"],
  maxAge: 86400, // 24 hours
};

// Apply CORS to static files (must be before static serving)
app.use("/uploads", cors(staticCorsOptions));

// Handle OPTIONS requests for static files (preflight)
app.options("/uploads/*", cors(staticCorsOptions));

// Log all static file requests
app.use("/uploads", (req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] Static file requested: ${req.method} ${
      req.originalUrl
    }`
  );
  next();
});

// Serve static files with security headers and CORS
// NOTE: CORS is already handled by cors() middleware above, but we ensure headers here too
app.use(
  "/uploads",
  express.static(uploadsPath, {
    setHeaders: (res, filePath) => {
      // CORS headers - MUST be set for cross-origin requests
      const origin = res.req.headers.origin;
      if (origin) {
        // Only set if origin is in allowed list
        if (origin.includes('localhost:3000') || origin.includes('orbashower.com')) {
          res.setHeader("Access-Control-Allow-Origin", origin);
          res.setHeader("Access-Control-Allow-Credentials", "true");
        } else {
          res.setHeader("Access-Control-Allow-Origin", "*");
        }
      } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
      }
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Vary", "Origin");
      
      // Security headers
      res.setHeader("X-Content-Type-Options", "nosniff");
      // Note: X-Frame-Options: DENY can cause issues with images, use SAMEORIGIN instead
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader("Referrer-Policy", "same-origin");

      // Cache control
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      // Log the file being served
      console.log(`✅ Serving file: ${filePath}`);
    },
  })
);

// Note: 404 handler for static files moved to end, after all static serving middleware

// Serve static files with proper caching headers and CORS (fallback)
app.use(
  "/uploads",
  express.static(uploadsPath, {
    ...staticOptions,
    // Enable fallthrough to handle 404s
    fallthrough: true,
    // Custom 404 handler
    setHeaders: (res, path) => {
      // CORS headers - CRITICAL for cross-origin image requests
      const origin = res.req.headers.origin;
      if (origin && (origin.includes('localhost:3000') || origin.includes('orbashower.com'))) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
      } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
      }
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      
      // Call the original setHeaders function
      if (staticOptions.setHeaders) {
        staticOptions.setHeaders(res, path);
      }

      // Add additional security headers
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("X-XSS-Protection", "1; mode=block");

      // Cache control for static assets
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  })
);

// Log static file requests in development (before static serving)
if (process.env.NODE_ENV === "development") {
  app.use("/uploads", (req, res, next) => {
    console.log(`📁 Static file requested: ${req.originalUrl}`);
    next();
  });
}

// Handle 404 for static files (after all static serving middleware)
app.use("/uploads", (req, res) => {
  const filePath = path.join(uploadsPath, req.path.replace(/^\/+/, ""));
  console.error(`❌ Static file not found: ${req.originalUrl}`);
  console.error(`   Resolved path: ${filePath}`);
  console.error(`   File exists: ${fs.existsSync(filePath)}`);
  
  res.status(404).json({
    error: "File not found",
    path: req.originalUrl,
    resolvedPath: filePath,
    exists: fs.existsSync(filePath),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", simpleCartRoutes);
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/admin-panel", adminProductRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin-panel/categories", adminCategoriesRoutes);
app.use("/api/product-images", productImagesRoutes);
app.use("/api/upload", uploadRoutes);

// Hotel routes
app.use("/api/rooms", roomsRoutes);
app.use("/api/room-types", roomTypesRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/admin/rooms", adminRoomsRoutes);
app.use("/api/admin/room-types", adminRoomTypesRoutes);
const roomUploadsRoutes = require("./routes/room-uploads");
app.use("/api/admin/room-uploads", roomUploadsRoutes);
app.use("/api/admin/menu", adminMenuRoutes);

// Debug: Log route registration
if (adminRoomTypesRoutes) {
  console.log('✅ Admin room types routes registered at /api/admin/room-types');
} else {
  console.error('❌ Admin room types routes NOT loaded!');
}

// Test endpoints
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Showecabin API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Simple test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working!",
    timestamp: new Date().toISOString(),
    headers: req.headers,
  });
});

// Debug: Test route registration
app.get("/api/debug/routes", (req, res) => {
  res.json({
    routes: {
      "admin-rooms": !!adminRoomsRoutes,
      "admin-room-types": !!adminRoomTypesRoutes,
      "room-types": !!roomTypesRoutes,
    },
    message: "Route registration check"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle static file not found
  if (err.status === 404 && req.path.startsWith("/uploads/")) {
    return res.status(404).json({
      error: "File not found",
      message: "The requested image could not be found",
    });
  }

  res.status(err.status || 500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});
app.get("/", (req, res) => res.send("backend API is running..."));
// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Database connection check
async function checkDatabaseConnection() {
  try {
    const result = await db.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database connection successful!');
    console.log(`📅 Database time: ${result.rows[0].current_time}`);
    const version = result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1];
    console.log(`🐘 PostgreSQL version: ${version}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // Provide helpful troubleshooting tips
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   - Make sure PostgreSQL is running');
      console.error('   - Check if the host and port are correct');
      console.error('   - Verify DB_HOST and DB_PORT in .env file');
    } else if (error.code === '28P01' || error.message.includes('password authentication')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   - Check if DB_USER and DB_PASSWORD are correct');
      console.error('   - Verify the user has access to the database');
    } else if (error.code === '3D000' || error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   - Check if DB_NAME is correct');
      console.error('   - The database might need to be created');
    }
    
    return false;
  }
}

// Start server and check database connection
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🔍 Checking database connection...');
  await checkDatabaseConnection();
});

