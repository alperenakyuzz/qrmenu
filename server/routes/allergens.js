const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const authenticateToken = require('../middleware/auth');

// GET /api/allergens — public (menüde ikon gösterimi)
router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, title, icon, sort_order
    FROM allergens
    ORDER BY sort_order ASC, id ASC
  `).all();
  res.json(rows);
});

// POST /api/allergens
router.post('/', authenticateToken, (req, res) => {
  const { title, icon, sort_order } = req.body;
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!icon || !String(icon).trim()) {
    return res.status(400).json({ error: 'Icon is required' });
  }

  const db = getDb();
  try {
    const result = db.prepare(`
      INSERT INTO allergens (title, icon, sort_order)
      VALUES (?, ?, ?)
    `).run(title.trim(), icon.trim(), sort_order ?? 0);

    const row = db.prepare('SELECT * FROM allergens WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/allergens/:id
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, icon, sort_order } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT * FROM allergens WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Allergen not found' });
  }

  const nextTitle = title !== undefined ? String(title).trim() : existing.title;
  const nextIcon = icon !== undefined ? String(icon).trim() : existing.icon;
  if (!nextTitle) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!nextIcon) {
    return res.status(400).json({ error: 'Icon is required' });
  }

  try {
    db.prepare(`
      UPDATE allergens SET title = ?, icon = ?, sort_order = ?
      WHERE id = ?
    `).run(
      nextTitle,
      nextIcon,
      sort_order !== undefined ? sort_order : existing.sort_order,
      id
    );

    const row = db.prepare('SELECT * FROM allergens WHERE id = ?').get(id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/allergens/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM allergens WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Allergen not found' });
  }

  try {
    db.prepare('DELETE FROM allergens WHERE id = ?').run(id);
    res.json({ message: 'Allergen deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
