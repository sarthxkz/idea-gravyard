// db/connection.js – MySQL2 connection pool
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'idea_graveyard_db',
  port:               parseInt(process.env.DB_PORT || '3306'),
  waitForConnections:  true,
  connectionLimit:     10,
  queueLimit:          0,
  charset:             'utf8mb4',
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined,
});

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅  MySQL connected to:', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('❌  MySQL connection error:', err);
    // process.exit(1);
  }
})();

module.exports = pool;
