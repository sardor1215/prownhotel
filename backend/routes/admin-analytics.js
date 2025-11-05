const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Authentication middleware (optional - kept for reference)
const optionalAuth = (req, res, next) => {
  // In a production environment, you might want to implement proper authentication here
  // For this demo, we're allowing unauthenticated access to analytics
  next();
};

// Helper function to get date range based on period
const getDateRange = (period) => {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'daily':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7); // Last 7 days
      break;
    case 'weekly':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30); // Last 30 days
      break;
    case 'monthly':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 12); // Last 12 months
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
  }
  
  return { startDate, endDate: now };
};

// Get product sales analytics
router.get('/product-sales', optionalAuth, async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const { startDate } = getDateRange(period);
    
    const query = `
      SELECT 
        p.id,
        p.name,
        p.category_name as category,
        COALESCE(SUM(oi.quantity), 0) as sales_count,
        COALESCE(SUM(oi.quantity * oi.product_price), 0) as total_revenue
      FROM products p
      LEFT JOIN simple_order_items oi ON p.id = oi.product_id
      LEFT JOIN simple_orders o ON oi.order_id = o.id
      WHERE o.created_at >= $1 OR o.created_at IS NULL
      GROUP BY p.id, p.name, p.category_name
      ORDER BY sales_count DESC, total_revenue DESC
    `;
    
    const result = await pool.query(query, [startDate]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching product sales:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visitor statistics
router.get('/visitors', optionalAuth, async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const { startDate } = getDateRange(period);
    
    const query = `
      SELECT 
        date,
        visitors,
        page_views,
        unique_visitors
      FROM visitor_stats
      WHERE date >= $1
      ORDER BY date DESC
    `;
    
    const result = await pool.query(query, [startDate.toISOString().split('T')[0]]);
    
    // If no data exists, create some sample data
    if (result.rows.length === 0) {
      const mockData = [];
      const days = period === 'daily' ? 7 : period === 'weekly' ? 30 : 90;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const visitors = Math.floor(Math.random() * 100) + 20;
        const pageViews = visitors * (Math.floor(Math.random() * 5) + 2);
        
        mockData.push({
          date: date.toISOString().split('T')[0],
          visitors,
          page_views: pageViews
        });
      }
      
      return res.json(mockData);
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sales statistics
router.get('/sales-stats', optionalAuth, async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const { startDate } = getDateRange(period);
    
    // Get current period stats
    const currentStatsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as avg_order_value
      FROM simple_orders
      WHERE created_at >= $1
    `;
    
    const currentResult = await pool.query(currentStatsQuery, [startDate]);
    const currentStats = currentResult.rows[0];
    
    // Get previous period stats for growth calculation
    const prevStartDate = new Date(startDate);
    const periodDiff = new Date() - startDate;
    prevStartDate.setTime(prevStartDate.getTime() - periodDiff);
    
    const prevStatsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM simple_orders
      WHERE created_at >= $1 AND created_at < $2
    `;
    
    const prevResult = await pool.query(prevStatsQuery, [prevStartDate, startDate]);
    const prevStats = prevResult.rows[0];
    
    // Calculate growth rate
    const currentRevenue = parseFloat(currentStats.total_revenue);
    const prevRevenue = parseFloat(prevStats.total_revenue);
    const growthRate = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    
    res.json({
      total_orders: parseInt(currentStats.total_orders),
      total_revenue: currentRevenue,
      avg_order_value: parseFloat(currentStats.avg_order_value),
      growth_rate: growthRate
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard overview
router.get('/overview', optionalAuth, async (req, res) => {
  try {
    // Get basic counts
    const overviewQuery = `
      SELECT 
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM simple_orders) as total_orders,
        (SELECT COUNT(DISTINCT email) FROM simple_orders) as total_customers,
        (SELECT COALESCE(SUM(total_amount), 0) FROM simple_orders) as total_revenue
    `;
    
    const result = await pool.query(overviewQuery);
    const overview = result.rows[0];
    
    // Get recent orders
    const recentOrdersQuery = `
      SELECT id, email, total_amount, status, created_at
      FROM simple_orders
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    const recentOrders = await pool.query(recentOrdersQuery);
    
    res.json({
      overview: {
        total_products: parseInt(overview.total_products),
        total_orders: parseInt(overview.total_orders),
        total_customers: parseInt(overview.total_customers),
        total_revenue: parseFloat(overview.total_revenue)
      },
      recent_orders: recentOrders.rows
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
