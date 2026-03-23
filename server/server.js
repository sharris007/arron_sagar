const express = require('express');
const cors = require('cors');
const path = require('path');
const { getPool, initDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../client/build')));

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

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
