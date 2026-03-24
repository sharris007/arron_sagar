const mysql = require('mysql2/promise');

const DB_NAME = process.env.DB_NAME || 'aaron_it_out';
const isManaged = !!process.env.JAWSDB_URL || !!process.env.CLEARDB_DATABASE_URL;

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  waitForConnections: true,
  connectionLimit: isManaged ? 4 : 10,
  queueLimit: 0
};

let pool;

const DEFAULT_CAROUSEL = [
  { item_type: 'image',  file_path: '/images/carousel/golden-field.png' },
  { item_type: 'quote',  file_path: null, quote_text: '\u201cCamilla was phenomenal! It was such a pleasure working with her and the photos came out AMAZING!!! Could NOT be happier with our experience!\u201d', quote_author: '-Laura', quote_service: 'Photography', quote_location: 'Newtown, PA' },
  { item_type: 'image',  file_path: '/images/carousel/422480_0413.jpg' },
  { item_type: 'quote',  file_path: null, quote_text: '\u201cOur DJ gave us exactly what we wanted, and was extremely flexible and fun!\u201d', quote_author: '-Kelsey', quote_service: 'Disc Jockey', quote_location: 'Chicago, IL' },
  { item_type: 'image',  file_path: '/images/carousel/6232384_0637.jpg' },
  { item_type: 'quote',  file_path: null, quote_text: '\u201cI want to make sure that I give thanks to everyone at the Pros that made our wedding day spectacular! You all come HIGHLY recommended from me!\u201d', quote_author: '-Adrianna', quote_service: 'Videography', quote_location: 'Bridgewater, NJ' },
  { item_type: 'image',  file_path: '/images/carousel/1219992_1051.jpg' },
];

async function addColumnSafe(connection, table, column, definition) {
  try {
    const [cols] = await connection.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
    if (cols.length === 0) {
      await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      console.log(`Added column ${column} to ${table}`);
    }
  } catch (err) {
    console.log(`Column check/add for ${column}: ${err.message}`);
  }
}

async function initDatabase() {
  let connection;
  try {
    // On managed MySQL (JawsDB/ClearDB) the database already exists and the user
    // may not have CREATE DATABASE privileges, so skip that step.
    if (!isManaged) {
      const tempConnection = await mysql.createConnection(poolConfig);
      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
      await tempConnection.end();
    }
    console.log(`Database "${DB_NAME}" ready`);

    pool = mysql.createPool({ ...poolConfig, database: DB_NAME });

    connection = await pool.getConnection();
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

    // Migrate: rename carousel_items → images if the old table still exists
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'carousel_items'",
      [DB_NAME]
    );
    if (tables.length > 0) {
      const [imgTable] = await connection.query(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'images'",
        [DB_NAME]
      );
      if (imgTable.length === 0) {
        await connection.query('RENAME TABLE carousel_items TO images');
        console.log('Renamed carousel_items → images');
      }
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        position INT NOT NULL DEFAULT 0,
        item_type VARCHAR(20) NOT NULL DEFAULT 'image',
        file_path VARCHAR(500),
        quote_text TEXT,
        quote_author VARCHAR(255),
        quote_service VARCHAR(255),
        quote_location VARCHAR(255),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        section VARCHAR(20) NOT NULL DEFAULT 'carousel',
        image_text TEXT,
        text_position VARCHAR(50)
      )
    `);

    // Ensure new columns exist on tables that were migrated from carousel_items
    await addColumnSafe(connection, 'images', 'section', "VARCHAR(20) NOT NULL DEFAULT 'carousel'");
    await addColumnSafe(connection, 'images', 'image_text', 'TEXT');
    await addColumnSafe(connection, 'images', 'text_position', 'VARCHAR(50)');

    const [rows] = await connection.query('SELECT COUNT(*) AS cnt FROM images');
    if (rows[0].cnt === 0) {
      for (let i = 0; i < DEFAULT_CAROUSEL.length; i++) {
        const d = DEFAULT_CAROUSEL[i];
        await connection.query(
          `INSERT INTO images (position, item_type, section, file_path, quote_text, quote_author, quote_service, quote_location, is_default)
           VALUES (?, ?, 'carousel', ?, ?, ?, ?, ?, TRUE)`,
          [i, d.item_type, d.file_path, d.quote_text || null, d.quote_author || null, d.quote_service || null, d.quote_location || null]
        );
      }
      console.log('Carousel seeded with default items');
    }

    console.log('Database tables initialized');
    return true;
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    console.log('Server will continue without database — form submissions logged to console only');
    pool = null;
    return false;
  } finally {
    if (connection) connection.release();
  }
}

function getPool() {
  return pool;
}

module.exports = { getPool, initDatabase };
