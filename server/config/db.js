const mysql = require('mysql2/promise');

const DB_NAME = process.env.DB_NAME || 'aaron_it_out';

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

async function initDatabase() {
  try {
    const tempConnection = await mysql.createConnection(poolConfig);

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`Database "${DB_NAME}" ready`);
    await tempConnection.end();

    pool = mysql.createPool({ ...poolConfig, database: DB_NAME });

    const connection = await pool.getConnection();
    console.log('MySQL connected successfully');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        wedding_date VARCHAR(20),
        wedding_location VARCHAR(255),
        ok_to_text BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database tables initialized nice');

    connection.release();
    return true;
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    console.log('Server will continue without database — form submissions logged to console only');
    pool = null;
    return false;
  }
}

function getPool() {
  return pool;
}

module.exports = { getPool, initDatabase };
