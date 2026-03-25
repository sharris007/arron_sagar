const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
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
  try {
    const source = await cloudinary.api.resource(publicId);

    const archivePrefix = `${CLOUD_ROOT}/archive`;
    let duplicateFound = false;
    let nextCursor = undefined;
    do {
      const opts = { type: 'upload', prefix: archivePrefix, max_results: 500 };
      if (nextCursor) opts.next_cursor = nextCursor;
      const listing = await cloudinary.api.resources(opts);
      if (listing.resources.some(r =>
        r.bytes === source.bytes && r.width === source.width && r.height === source.height
      )) {
        duplicateFound = true;
        break;
      }
      nextCursor = listing.next_cursor;
    } while (nextCursor);

    if (duplicateFound) {
      await cloudinary.uploader.destroy(publicId);
      console.log('Cloudinary deleted (duplicate already in archive):', publicId);
    } else {
      const filename = publicId.split('/').pop();
      const archiveId = `${CLOUD_ROOT}/archive/${filename}`;
      await cloudinary.uploader.rename(publicId, archiveId, { overwrite: true });
      console.log('Cloudinary archived:', publicId, '->', archiveId);
    }
  } catch (err) {
    console.error('Cloudinary archive failed:', err.message);
  }
}

// ── Static file serving ──────────────────────────────────
app.use(express.static(path.join(__dirname, '../client/build'), { redirect: false }));
app.use(express.static(path.join(__dirname, '../client/public'), { redirect: false }));

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
        image_text_html: row.image_text_html || null,
        text_position: row.text_position || null,
        title: row.title || null,
        description: row.description || null,
        image_service: row.image_service || null,
        image_place: row.image_place || null,
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
  const image_service = req.body.image_service || '';
  const image_place = req.body.image_place || '';
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
        "INSERT INTO images (position, item_type, section, file_path, is_default, title, description, image_service, image_place) VALUES (0, 'image', 'hero', ?, FALSE, ?, ?, ?, ?)",
        [imageUrl, title || null, description || null, image_service || null, image_place || null]
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
  const { image_text, image_text_html, text_position, image_service, image_place } = req.body;
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    await pool.query(
      'UPDATE images SET image_text = ?, image_text_html = ?, text_position = ?, image_service = ?, image_place = ? WHERE id = ?',
      [image_text || null, image_text_html || null, text_position || null, image_service || null, image_place || null, id]
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
      'UPDATE images SET image_text = NULL, image_text_html = NULL, text_position = NULL, image_service = NULL, image_place = NULL WHERE id = ?',
      [id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Text delete failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/images/:id/quote', async (req, res) => {
  const { id } = req.params;
  const { quote_text, quote_author, quote_service, quote_location } = req.body;
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    await pool.query(
      'UPDATE images SET quote_text = ?, quote_author = ?, quote_service = ?, quote_location = ? WHERE id = ?',
      [quote_text || null, quote_author || null, quote_service || null, quote_location || null, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Quote update failed:', err.message);
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
  const image_service = req.body.image_service || '';
  const image_place = req.body.image_place || '';
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'carousel', req.file.originalname, { title, description });
    const imageUrl = result.secure_url;
    await pool.query("UPDATE images SET position = position + 1 WHERE section = 'carousel'");
    const [ins] = await pool.query(
      "INSERT INTO images (position, item_type, section, file_path, is_default, title, description, image_service, image_place) VALUES (0, 'image', 'carousel', ?, FALSE, ?, ?, ?, ?)",
      [imageUrl, title || null, description || null, image_service || null, image_place || null]
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
      "INSERT INTO images (position, item_type, section, file_path, is_default, title, description, quote_text, quote_author, quote_service, quote_location) VALUES (0, 'quote', 'carousel', ?, FALSE, ?, ?, ?, ?, ?, ?)",
      [imageUrl, title || null, description || null, req.body.quote_text || null, req.body.quote_author || null, req.body.quote_service || null, req.body.quote_location || null]
    );
    console.log('Testimonial added (Cloudinary):', imageUrl);
    res.json({ success: true, id: ins.insertId, file_path: imageUrl });
  } catch (err) {
    console.error('Carousel testimonial insert failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/carousel/:id/replace', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No valid image file provided' });
  }
  const title = req.body.title || '';
  const description = req.body.description || '';
  const image_service = req.body.image_service || '';
  const image_place = req.body.image_place || '';
  const quote_text = req.body.quote_text || null;
  const quote_author = req.body.quote_author || null;
  const quote_service = req.body.quote_service || null;
  const quote_location = req.body.quote_location || null;
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    const [rows] = await pool.query('SELECT * FROM images WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Item not found' });
    const oldItem = rows[0];
    if (oldItem.file_path) {
      await archiveInCloudinary(oldItem.file_path);
    }
    const result = await uploadToCloudinary(req.file.buffer, 'carousel', req.file.originalname, { title, description });
    const imageUrl = result.secure_url;
    if (quote_text !== null || quote_author !== null) {
      await pool.query(
        'UPDATE images SET file_path = ?, title = ?, description = ?, quote_text = ?, quote_author = ?, quote_service = ?, quote_location = ? WHERE id = ?',
        [imageUrl, title || null, description || null, quote_text, quote_author, quote_service, quote_location, id]
      );
    } else {
      await pool.query(
        'UPDATE images SET file_path = ?, title = ?, description = ?, image_service = ?, image_place = ? WHERE id = ?',
        [imageUrl, title || null, description || null, image_service || null, image_place || null, id]
      );
    }
    console.log('Carousel image replaced:', id, '->', imageUrl);
    res.json({ success: true, id: Number(id), file_path: imageUrl });
  } catch (err) {
    console.error('Carousel replace failed:', err.message);
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

// ── Stencil pipeline ─────────────────────────────────────

const BADGE_TEMPLATE = path.join(__dirname, 'assets/badge_template.png');
const ICON_COLOR = { r: 0, g: 56, b: 99 }; // #003863

async function stencilIcon(buffer) {
  const badge = await sharp(BADGE_TEMPLATE).ensureAlpha().toBuffer();
  const badgeMeta = await sharp(badge).metadata();
  const bW = badgeMeta.width;
  const bH = badgeMeta.height;
  const iconSize = Math.round(Math.min(bW, bH) * 0.48);

  const preprocessed = await sharp(buffer)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
    .greyscale()
    .normalize()
    .toBuffer();

  // Edge detection via Laplacian kernel for clean outlines
  const { data: edgeData } = await sharp(preprocessed)
    .sharpen({ sigma: 2 })
    .convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] })
    .normalize()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Smoothed threshold for solid fill areas
  const { data: fillData, info } = await sharp(preprocessed)
    .blur(1.2)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  // Detect background brightness from corner samples
  const corners = [0, w - 1, (h - 1) * w, (h - 1) * w + w - 1];
  let cornerSum = 0;
  for (const idx of corners) cornerSum += fillData[idx * 4];
  const bgIsLight = cornerSum / corners.length > 128;

  // Combine solid fill + edge outlines to match SVG icon style
  const pixels = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const grey = fillData[i * 4];
    const edge = edgeData[i * 4];
    const isFill = bgIsLight ? grey < 110 : grey > 145;
    const isEdge = edge > 50;
    pixels[i * 4] = ICON_COLOR.r;
    pixels[i * 4 + 1] = ICON_COLOR.g;
    pixels[i * 4 + 2] = ICON_COLOR.b;
    pixels[i * 4 + 3] = (isFill || isEdge) ? 255 : 0;
  }

  const coloredIcon = await sharp(pixels, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();

  const left = Math.round((bW - w) / 2);
  const top = Math.round((bH - h) / 2);

  return sharp(badge)
    .composite([{ input: coloredIcon, left, top }])
    .png()
    .toBuffer();
}

// ── Services API ─────────────────────────────────────────

app.get('/api/services', async (req, res) => {
  const pool = getPool();
  if (!pool) return res.json({ success: true, items: [], background: null });
  try {
    const [cards] = await pool.query("SELECT * FROM services WHERE section = 'card' ORDER BY position ASC");
    const [bgRows] = await pool.query("SELECT * FROM services WHERE section = 'background' LIMIT 1");
    res.json({
      success: true,
      items: cards,
      background: bgRows.length ? bgRows[0].icon_path : null,
    });
  } catch (err) {
    console.error('Services fetch failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/footer', async (req, res) => {
  const pool = getPool();
  if (!pool) return res.json({ success: true, footer: null });
  try {
    const [rows] = await pool.query("SELECT file_path FROM images WHERE section = 'footer' LIMIT 1");
    res.json({ success: true, footer: rows.length ? rows[0].file_path : null });
  } catch (err) {
    console.error('Footer fetch failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/services', upload.single('icon'), async (req, res) => {
  const { service_name, price, link } = req.body;
  if (!service_name) return res.status(400).json({ success: false, error: 'service_name required' });
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });

  let iconUrl = null;
  if (req.file) {
    try {
      const stenciled = await stencilIcon(req.file.buffer);
      const result = await uploadToCloudinary(stenciled, 'services', req.file.originalname);
      iconUrl = result.secure_url;
    } catch (err) {
      console.error('Icon stencil/upload failed:', err.message);
    }
  }

  try {
    const [maxRow] = await pool.query("SELECT COALESCE(MAX(position), -1) AS maxPos FROM services WHERE section = 'card'");
    const nextPos = maxRow[0].maxPos + 1;
    const [ins] = await pool.query(
      "INSERT INTO services (position, section, icon_path, service_name, price, link) VALUES (?, 'card', ?, ?, ?, ?)",
      [nextPos, iconUrl, service_name, price || null, link || '#']
    );
    res.json({ success: true, id: ins.insertId, icon_path: iconUrl });
  } catch (err) {
    console.error('Service create failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Services background image ──

app.put('/api/services/background', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' });
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    const [existing] = await pool.query("SELECT * FROM services WHERE section = 'background' LIMIT 1");
    if (existing.length && existing[0].icon_path) {
      await archiveInCloudinary(existing[0].icon_path);
    }
    const result = await uploadToCloudinary(req.file.buffer, 'services', req.file.originalname);
    if (existing.length) {
      await pool.query("UPDATE services SET icon_path = ? WHERE section = 'background'", [result.secure_url]);
    } else {
      await pool.query(
        "INSERT INTO services (position, section, icon_path, service_name, price) VALUES (0, 'background', ?, 'Services Background', NULL)",
        [result.secure_url]
      );
    }
    res.json({ success: true, background: result.secure_url });
  } catch (err) {
    console.error('Background upload failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/services/background', async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    const [rows] = await pool.query("SELECT * FROM services WHERE section = 'background' LIMIT 1");
    if (rows.length) {
      if (rows[0].icon_path) await archiveInCloudinary(rows[0].icon_path);
      await pool.query("DELETE FROM services WHERE section = 'background'");
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Background delete failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/services/reorder', async (req, res) => {
  const { idA, idB } = req.body;
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    const [rows] = await pool.query('SELECT id, position FROM services WHERE id IN (?, ?)', [idA, idB]);
    if (rows.length !== 2) return res.status(404).json({ success: false, error: 'Items not found' });
    const posA = rows.find(r => r.id === idA).position;
    const posB = rows.find(r => r.id === idB).position;
    await pool.query('UPDATE services SET position = ? WHERE id = ?', [posB, idA]);
    await pool.query('UPDATE services SET position = ? WHERE id = ?', [posA, idB]);
    res.json({ success: true });
  } catch (err) {
    console.error('Services reorder failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const { service_name, price, link } = req.body;
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    await pool.query(
      'UPDATE services SET service_name = ?, price = ?, link = ? WHERE id = ?',
      [service_name, price || null, link || '#', id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Service update failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/services/:id/icon', upload.single('icon'), async (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' });
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });

  try {
    const [rows] = await pool.query('SELECT icon_path FROM services WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });

    if (rows[0].icon_path) {
      await archiveInCloudinary(rows[0].icon_path);
    }

    const stenciled = await stencilIcon(req.file.buffer);
    const result = await uploadToCloudinary(stenciled, 'services', req.file.originalname);
    await pool.query('UPDATE services SET icon_path = ? WHERE id = ?', [result.secure_url, id]);
    res.json({ success: true, icon_path: result.secure_url });
  } catch (err) {
    console.error('Service icon replace failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  if (!pool) return res.status(500).json({ success: false, error: 'No database' });
  try {
    const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    const item = rows[0];
    await pool.query('DELETE FROM services WHERE id = ?', [id]);
    await pool.query('UPDATE services SET position = position - 1 WHERE position > ?', [item.position]);
    if (item.icon_path) {
      await archiveInCloudinary(item.icon_path);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Service delete failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
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
