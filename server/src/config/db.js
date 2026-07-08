import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tannery_mini_erp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Warm up the pool by establishing a connection at startup
// This prevents the first request from failing due to cold connection delay
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection pool initialized successfully');
    connection.release();
  } catch (err) {
    console.error('Failed to initialize database connection pool:', err.message);
  }
})();

export default pool;
