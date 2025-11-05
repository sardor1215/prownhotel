const { Pool } = require('pg');
const url = require('url');

// Parse the DATABASE_URL for Neon PostgreSQL
let poolConfig;

if (process.env.DATABASE_URL) {
  const params = url.parse(process.env.DATABASE_URL);
  const auth = params.auth.split(':');
  
  poolConfig = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
  
  console.log('🔗 Using DATABASE_URL connection');
} else {
  // Fallback to individual env vars
  poolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
  
  console.log('🔗 Using individual DB environment variables');
  console.log(`   Host: ${poolConfig.host}`);
  console.log(`   Port: ${poolConfig.port}`);
  console.log(`   Database: ${poolConfig.database}`);
  console.log(`   User: ${poolConfig.user}`);
  console.log(`   Password: ${poolConfig.password ? '***' : 'NOT SET'}`);
}

const pool = new Pool(poolConfig);

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}; 