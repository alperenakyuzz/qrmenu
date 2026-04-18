const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const authenticateToken = require('../middleware/auth');

// GET /api/settings - public
router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all();

  const settings = {};
  rows.forEach(row => {
    settings[row.key] = row.value;
  });

  res.json(settings);
});

// PUT /api/settings - protected
router.put('/', authenticateToken, (req, res) => {
  const updates = req.body;

  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Settings object is required' });
  }

  const db = getDb();

  try {
    const upsert = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    const updateMany = db.transaction((updates) => {
      for (const [key, value] of Object.entries(updates)) {
        upsert.run(key, String(value));
      }
    });

    updateMany(updates);

    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
