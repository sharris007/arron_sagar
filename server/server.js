const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getPool, initDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const imagesDir = path.join(__dirname, '../client/public/images');
const carouselDir = path.join(imagesDir, 'carousel');
const heroDir = path.join(imagesDir, 'hero');
const archiveDir = path.join(imagesDir, 'archive');

if (!fs.existsSync(carouselDir)) fs.mkdirSync(carouselDir, { recursive: true });
if (!fs.existsSync(heroDir)) fs.mkdirSync(heroDir, { recursive: true });
if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

function archiveFile(filePath) {
  const publicRoot = path.join(__dirname, '../client/public');
  const fullSrc = path.join(publicRoot, filePath);
  if (!fs.existsSync(fullSrc)) return;
  const basename = path.basename(filePath);
  const dest = path.join(archiveDir, basename);
  if (fs.existsSync(dest)) {
    fs.unlinkSync(fullSrc);
    console.log(`Duplicate in archive, deleted source: ${basename}`);
    return;
  }
  try {
    fs.renameSync(fullSrc, dest);
    console.log(`Archived: ${basename}`);
  } catch (err) {
    try {
      fs.copyFileSync(fullSrc, dest);
      fs.unlinkSync(fullSrc);
      console.log(`Archived (copy+delete): ${basename}`);
    } catch (e) {
      console.error('Archive failed:', e.message);
    }
  }
}

function makeFilename(origName) {
  const ext = path.extname(origName);
  const base = path.basename(origName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, 50);
  return `${base}-${Date.now()}${ext}`;
}

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  cb(null, ext && mime);
};

const generalUpload = multer({
  storage: multer.diskStorage({
    destination: imagesDir,
    filename: (req, file, cb) => cb(null, makeFilename(file.originalname))
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter
});

const carouselUpload = multer({
  storage: multer.diskStorage({
    destination: carouselDir,
    filename: (req, file, cb) => cb(null, makeFilename(file.originalname))
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter
});

const heroUpload = multer({
  storage: multer.diskStorage({
    destination: heroDir,
    filename: (req, file, cb) => cb(null, makeFilename(file.originalname))
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter
});

app.use(express.static(path.join(__dirname, '../client/build')));
app.use(express.static(path.join(__dirname, '../client/public')));

app.post('/api/upload', generalUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No valid image file provided' });
  }
  const imageUrl = `/images/${req.file.filename}`;
  console.log('Image uploaded to public/images:', req.file.filename);
  res.json({ success: true, imageUrl, filename: req.file.filename });
});

async function ensureHeroInDb() {
  const pool = getPool();
  if (!pool) return;
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS cnt FROM images WHERE section = 'hero'");
    if (rows[0].cnt > 0) return;
    const allowed = /\.(jpe?g|png|gif|webp|svg)$/i;
    const files = fs.readdirSync(heroDir).filter(f => allowed.test(f));
    if (files.length > 0) {
      const filePath = `/images/hero/${files[0]}`;
      await pool.query(
        "INSERT INTO images (position, item_type, section, file_path, is_default) VALUES (0, 'image', 'hero', ?, FALSE)",
        [filePath]
      );
      console.log('Imported existing hero image into DB:', filePath);
    }
  } catch (err) {
    console.error('Hero auto-import failed:', err.message);
  }
}

// ── Hero API (DB-backed) ──────────────────────────────────

app.get('/api/hero', async (req, res) => {
  const pool = getPool();
  if (!pool) return res.json({ success: true, file_path: null });
  try {
    const [rows] = await pool.query(
      "SELECT * FROM images WHERE section = 'hero' LIMIT 1"
    );
    if (rows.length > 0) {
      const row = rows[0];
      res.json({
        success: true,
        id: row.id,
        file_path: row.file_path,
        image_text: row.image_text || null,
        text_position: row.text_position || null,
      });
    } else {
      res.json({ success: true, file_path: null });
    }
  } catch (err) {
    console.error('Hero fetch failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/hero/upload', heroUpload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No valid image file provided' });
  }
  const filePath = `/images/hero/${req.file.filename}`;
  const pool = getPool();

  const allowed = /\.(jpe?g|png|gif|webp|svg)$/i;
  const existing = fs.readdirSync(heroDir).filter(f => allowed.test(f) && f !== req.file.filename);
  existing.forEach(f => archiveFile(`/images/hero/${f}`));

  if (!pool) {
    console.log('Hero image uploaded (no DB):', filePath);
    return res.json({ success: true, file_path: filePath });
  }

  try {
    await pool.query("DELETE FROM images WHERE section = 'hero'");
    const [result] = await pool.query(
      "INSERT INTO images (position, item_type, section, file_path, is_default) VALUES (0, 'image', 'hero', ?, FALSE)",
      [filePath]
    );
    console.log('Hero image uploaded:', filePath);
    res.json({ success: true, id: result.insertId, file_path: filePath });
  } catch (err) {
    console.error('Hero DB insert failed:', err.message);
    res.json({ success: true, file_path: filePath });
  }
});

app.delete('/api/hero', async (req, res) => {
  const pool = getPool();
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM images WHERE section = 'hero'");
      if (rows.length > 0 && rows[0].file_path) {
        archiveFile(rows[0].file_path);
      }
      await pool.query("DELETE FROM images WHERE section = 'hero'");
    } catch (err) {
      console.error('Hero delete failed:', err.message);
    }
  }
  const allowedExt = /\.(jpe?g|png|gif|webp|svg)$/i;
  try {
    fs.readdirSync(heroDir).filter(f => allowedExt.test(f)).forEach(f => archiveFile(`/images/hero/${f}`));
  } catch (e) { /* ignore */ }
  res.json({ success: true });
});

// ── Image Text API (shared by hero + carousel) ───────────

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

// ── Carousel API ───────────────────────────────────────────

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

app.post('/api/carousel/image', carouselUpload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No valid image file provided' });
  }
  const filePath = `/images/carousel/${req.file.filename}`;
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    await pool.query("UPDATE images SET position = position + 1 WHERE section = 'carousel'");
    const [result] = await pool.query(
      "INSERT INTO images (position, item_type, section, file_path, is_default) VALUES (0, 'image', 'carousel', ?, FALSE)",
      [filePath]
    );
    console.log('Carousel image added:', filePath);
    res.json({ success: true, id: result.insertId, file_path: filePath });
  } catch (err) {
    console.error('Carousel image insert failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/carousel/testimonial', carouselUpload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No valid image file provided' });
  }
  const filePath = `/images/carousel/${req.file.filename}`;
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    await pool.query("UPDATE images SET position = position + 1 WHERE section = 'carousel'");
    const [result] = await pool.query(
      "INSERT INTO images (position, item_type, section, file_path, is_default) VALUES (0, 'image', 'carousel', ?, FALSE)",
      [filePath]
    );
    console.log('Testimonial image added to carousel:', filePath);
    res.json({ success: true, id: result.insertId, file_path: filePath });
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
      archiveFile(item.file_path);
    }
    console.log('Carousel item deleted:', id);
    res.json({ success: true });
  } catch (err) {
    console.error('Carousel delete failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Archive API ────────────────────────────────────────────

app.post('/api/archive-image', async (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ success: false, error: 'No filePath provided' });
  try {
    archiveFile(filePath);
    res.json({ success: true });
  } catch (err) {
    console.error('Archive request failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Leads API ──────────────────────────────────────────────

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
  await ensureHeroInDb();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
