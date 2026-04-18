const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const authenticateToken = require('../middleware/auth');

// GET /api/languages - public, returns active languages
router.get('/', (req, res) => {
  const db = getDb();
  const languages = db.prepare('SELECT * FROM languages WHERE is_active = 1 ORDER BY is_default DESC, name ASC').all();
  res.json(languages);
});

// GET /api/languages/all - admin, returns all languages
router.get('/all', authenticateToken, (req, res) => {
  const db = getDb();
  const languages = db.prepare('SELECT * FROM languages ORDER BY is_default DESC, name ASC').all();
  res.json(languages);
});

// POST /api/languages - create new language
router.post('/', authenticateToken, (req, res) => {
  const { code, name, is_active } = req.body;

  if (!code || !name) {
    return res.status(400).json({ error: 'Code and name are required' });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM languages WHERE code = ?').get(code);
  if (existing) {
    return res.status(409).json({ error: 'Language code already exists' });
  }

  try {
    const result = db.prepare(
      'INSERT INTO languages (code, name, is_default, is_active) VALUES (?, ?, 0, ?)'
    ).run(code.toLowerCase(), name, is_active !== undefined ? (is_active ? 1 : 0) : 1);

    const language = db.prepare('SELECT * FROM languages WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(language);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/languages/:id - update language
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, is_active, is_default } = req.body;

  const db = getDb();
  const language = db.prepare('SELECT * FROM languages WHERE id = ?').get(id);
  if (!language) {
    return res.status(404).json({ error: 'Language not found' });
  }

  try {
    if (is_default) {
      // Unset all defaults first
      db.prepare('UPDATE languages SET is_default = 0').run();
    }

    db.prepare(
      'UPDATE languages SET name = ?, is_active = ?, is_default = ? WHERE id = ?'
    ).run(
      name !== undefined ? name : language.name,
      is_active !== undefined ? (is_active ? 1 : 0) : language.is_active,
      is_default !== undefined ? (is_default ? 1 : 0) : language.is_default,
      id
    );

    const updated = db.prepare('SELECT * FROM languages WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/languages/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const language = db.prepare('SELECT * FROM languages WHERE id = ?').get(id);
  if (!language) {
    return res.status(404).json({ error: 'Language not found' });
  }

  if (language.is_default) {
    return res.status(400).json({ error: 'Cannot delete the default language' });
  }

  const count = db.prepare('SELECT COUNT(*) as count FROM languages').get();
  if (count.count <= 1) {
    return res.status(400).json({ error: 'Cannot delete the only language' });
  }

  try {
    // Delete translations
    db.prepare('DELETE FROM category_translations WHERE language_code = ?').run(language.code);
    db.prepare('DELETE FROM menu_item_translations WHERE language_code = ?').run(language.code);
    db.prepare('DELETE FROM languages WHERE id = ?').run(id);

    res.json({ message: 'Language deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
