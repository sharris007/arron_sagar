const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { getPool, initDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const APP_NAME = process.env.APP_NAME || 'Aaron Sager';
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const CLOUD_ROOT = APP_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '') + '_' + ENVIRONMENT;

app.use(cors());
app.use(express.json());

// ── Cloudinary config ─────────────────────────────────────
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'priority-endeavors-llc',
    api_key: process.env.CLOUDINARY_API_KEY || '556878598869775',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'PS33GlwsIV0G1tAn_AAd76_A8qk',
  });
}

// ── Local dirs (kept for static serving of legacy/default images) ──
const imagesDir = path.join(__dirname, '../client/public/images');
const carouselDir = path.join(imagesDir, 'carousel');
const heroDir = path.join(imagesDir, 'hero');

[carouselDir, heroDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ── Multer – memory storage for Cloudinary streaming ──
const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  cb(null, ext && mime);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// ── Cloudinary helpers ────────────────────────────────────
function escapeCtx(val) {
  return (val || '').replace(/[|=]/g, ' ').substring(0, 500);
}

function uploadToCloudinary(buffer, folder, originalName, { title, description } = {}) {
  return new Promise((resolve, reject) => {
    const base = path.basename(originalName, path.extname(originalName))
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .substring(0, 50);
    const publicId = `${base}-${Date.now()}`;

    const ctxParts = [
      `AppName=${escapeCtx(APP_NAME)}`,
      `Environment=${escapeCtx(ENVIRONMENT)}`,
    ];
    if (title) ctxParts.push(`caption=${escapeCtx(title)}`);
    if (description) ctxParts.push(`alt=${escapeCtx(description)}`);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${CLOUD_ROOT}/${folder}`,
        public_id: publicId,
        resource_type: 'image',
        context: ctxParts.join('|'),
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

function extractPublicId(url) {
  if (!url || !url.includes('cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}

async function archiveInCloudinary(url) {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  const filename = publicId.split('/').pop();
  const archiveId = `${CLOUD_ROOT}/archive/${filename}`;
  try {
    await cloudinary.uploader.rename(publicId, archiveId, { overwrite: true });
    console.log('Cloudinary archived:', publicId, '->', archiveId);
  } catch (err) {
    console.error('Cloudinary archive failed:', err.message);
  }
}

// ── Static file serving ──────────────────────────────────
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(express.static(path.join(__dirname, '../client/public')));

// ── General upload ───────────────────────────────────────
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No valid image file provided' });
  }
  const title = req.body.title || '';
  const description = req.body.description || '';
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'general', req.file.originalname, { title, description });
    console.log('Image uploaded to Cloudinary:', result.secure_url);
    res.json({ success: true, imageUrl: result.secure_url, filename: result.public_id });
  } catch (err) {
    console.error('Cloudinary upload failed:', err.message);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// ── Hero API ─────────────────────────────────────────────

app.get('/api/hero', async (req, res) => {
  const pool = getPool();
  if (!pool) return res.json({ success: true, file_path: null });
  try {
    const [rows] = await pool.query("SELECT * FROM images WHERE section = 'hero' LIMIT 1");
    if (rows.length > 0) {
      const row = rows[0];
      res.json({
        success: true,
        id: row.id,
        file_path: row.file_path,
        image_text: row.image_text || null,
        text_position: row.text_position || null,
        title: row.title || null,
        description: row.description || null,
      });
    } else {
      res.json({ success: true, file_path: null });
    }
  } catch (err) {
    console.error('Hero fetch failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/hero/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No valid image file provided' });
  }
  const title = req.body.title || '';
  const description = req.body.description || '';
  const pool = getPool();

  try {
    const result = await uploadToCloudinary(req.file.buffer, 'hero', req.file.originalname, { title, description });
    const imageUrl = result.secure_url;

    if (pool) {
      const [existing] = await pool.query("SELECT file_path FROM images WHERE section = 'hero'");
      for (const row of existing) {
        await archiveInCloudinary(row.file_path);
      }
      await pool.query("DELETE FROM images WHERE section = 'hero'");
      const [ins] = await pool.query(
        "INSERT INTO images (position, item_type, section, file_path, is_default, title, description) VALUES (0, 'image', 'hero', ?, FALSE, ?, ?)",
        [imageUrl, title || null, description || null]
      );
      console.log('Hero image uploaded to Cloudinary:', imageUrl);
      res.json({ success: true, id: ins.insertId, file_path: imageUrl });
    } else {
      console.log('Hero image uploaded (no DB):', imageUrl);
      res.json({ success: true, file_path: imageUrl });
    }
  } catch (err) {
    console.error('Hero upload failed:', err.message);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

app.delete('/api/hero', async (req, res) => {
  const pool = getPool();
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT file_path FROM images WHERE section = 'hero'");
      for (const row of rows) {
        await archiveInCloudinary(row.file_path);
      }
      await pool.query("DELETE FROM images WHERE section = 'hero'");
    } catch (err) {
      console.error('Hero delete failed:', err.message);
    }
  }
  res.json({ success: true });
});

// ── Image Text API ───────────────────────────────────────

app.put('/api/images/:id/text', async (req, res) => {
  const { id } = req.params;
  const { image_text, text_position } = req.body;
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    await pool.query(
      'UPDATE images SET image_text = ?, text_position = ? WHERE id = ?',
      [image_text || null, text_position || null, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Text update failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/images/:id/text', async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    await pool.query(
      'UPDATE images SET image_text = NULL, text_position = NULL WHERE id = ?',
      [id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Text delete failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Carousel API ─────────────────────────────────────────

app.get('/api/carousel', async (req, res) => {
  const pool = getPool();
  if (!pool) return res.json({ success: true, items: [] });
  try {
    const [rows] = await pool.query(
      "SELECT * FROM images WHERE section = 'carousel' ORDER BY position ASC"
    );
    res.json({ success: true, items: rows });
  } catch (err) {
    console.error('Carousel fetch failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/carousel/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No valid image file provided' });
  }
  const title = req.body.title || '';
  const description = req.body.description || '';
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'carousel', req.file.originalname, { title, description });
    const imageUrl = result.secure_url;
    await pool.query("UPDATE images SET position = position + 1 WHERE section = 'carousel'");
    const [ins] = await pool.query(
      "INSERT INTO images (position, item_type, section, file_path, is_default, title, description) VALUES (0, 'image', 'carousel', ?, FALSE, ?, ?)",
      [imageUrl, title || null, description || null]
    );
    console.log('Carousel image added (Cloudinary):', imageUrl);
    res.json({ success: true, id: ins.insertId, file_path: imageUrl });
  } catch (err) {
    console.error('Carousel image insert failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/carousel/testimonial', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No valid image file provided' });
  }
  const title = req.body.title || '';
  const description = req.body.description || '';
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'carousel', req.file.originalname, { title, description });
    const imageUrl = result.secure_url;
    await pool.query("UPDATE images SET position = position + 1 WHERE section = 'carousel'");
    const [ins] = await pool.query(
      "INSERT INTO images (position, item_type, section, file_path, is_default, title, description) VALUES (0, 'image', 'carousel', ?, FALSE, ?, ?)",
      [imageUrl, title || null, description || null]
    );
    console.log('Testimonial added (Cloudinary):', imageUrl);
    res.json({ success: true, id: ins.insertId, file_path: imageUrl });
  } catch (err) {
    console.error('Carousel testimonial insert failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/carousel/reorder', async (req, res) => {
  const { idA, idB } = req.body;
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    const [rows] = await pool.query(
      'SELECT id, position FROM images WHERE id IN (?, ?)', [idA, idB]
    );
    if (rows.length !== 2) return res.status(404).json({ success: false, error: 'Items not found' });
    const posA = rows.find(r => r.id === idA).position;
    const posB = rows.find(r => r.id === idB).position;
    await pool.query('UPDATE images SET position = ? WHERE id = ?', [posB, idA]);
    await pool.query('UPDATE images SET position = ? WHERE id = ?', [posA, idB]);
    res.json({ success: true });
  } catch (err) {
    console.error('Carousel reorder failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/carousel/:id', async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    const [rows] = await pool.query('SELECT * FROM images WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Item not found' });
    const item = rows[0];
    await pool.query('DELETE FROM images WHERE id = ?', [id]);
    await pool.query(
      "UPDATE images SET position = position - 1 WHERE section = 'carousel' AND position > ?",
      [item.position]
    );
    if (item.file_path) {
      await archiveInCloudinary(item.file_path);
    }
    console.log('Carousel item deleted (archived):', id);
    res.json({ success: true });
  } catch (err) {
    console.error('Carousel delete failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Leads API ─────────────────────────────────────────────

app.post('/api/find-professionals', async (req, res) => {
  const { name, email, phone, weddingDate, weddingLocation, okToText } = req.body;

  const pool = getPool();
  if (pool) {
    try {
      await pool.execute(
        'INSERT INTO leads (name, email, phone, wedding_date, wedding_location, ok_to_text) VALUES (?, ?, ?, ?, ?, ?)',
        [
          (name || '').trim(),
          (email || '').trim(),
          (phone || '').trim(),
          weddingDate || null,
          (weddingLocation || '').trim(),
          okToText ? 1 : 0
        ]
      );
      console.log('Lead saved to database:', { name, email, phone, weddingDate, weddingLocation, okToText });
    } catch (err) {
      console.log('Database insert failed:', err.message);
      console.log('Logging to console instead:', { name, email, phone, weddingDate, weddingLocation, okToText });
    }
  } else {
    console.log('No database connection — logging to console:', { name, email, phone, weddingDate, weddingLocation, okToText });
  }

  res.json({
    success: true,
    message: 'Thank you! A wedding consultant will be in touch shortly.'
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

initDatabase().then(async () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Cloudinary root folder: ${CLOUD_ROOT}`);
  });
});
