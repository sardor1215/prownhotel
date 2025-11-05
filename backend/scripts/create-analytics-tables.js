const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAnalyticsTables() {
  const client = await pool.connect();
  
  try {
    console.log('Creating analytics tables...');
    
    // Create visitor_stats table
    await client.query(`
      CREATE TABLE IF NOT EXISTS visitor_stats (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        visitors INTEGER DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date)
      );
    `);
    
    // Create page_views table for detailed tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        ip_address INET,
        user_agent TEXT,
        page_url TEXT,
        referrer TEXT,
        session_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_visitor_stats_date ON visitor_stats(date);
      CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
      CREATE INDEX IF NOT EXISTS idx_page_views_ip ON page_views(ip_address);
      CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
    `);
    
    // Insert some sample data for the current week
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const visitors = Math.floor(Math.random() * 100) + 20;
      const pageViews = visitors * (Math.floor(Math.random() * 5) + 2);
      const uniqueVisitors = Math.floor(visitors * 0.8);
      
      await client.query(`
        INSERT INTO visitor_stats (date, visitors, page_views, unique_visitors)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (date) DO UPDATE SET
          visitors = EXCLUDED.visitors,
          page_views = EXCLUDED.page_views,
          unique_visitors = EXCLUDED.unique_visitors,
          updated_at = CURRENT_TIMESTAMP
      `, [dateStr, visitors, pageViews, uniqueVisitors]);
    }
    
    console.log('✅ Analytics tables created successfully!');
    console.log('✅ Sample visitor data inserted!');
    
  } catch (error) {
    console.error('❌ Error creating analytics tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  createAnalyticsTables()
    .then(() => {
      console.log('🎉 Analytics setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = createAnalyticsTables;
