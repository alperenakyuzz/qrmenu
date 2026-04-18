const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const authenticateToken = require('../middleware/auth');

// GET /api/categories?lang=tr
router.get('/', (req, res) => {
  const { lang } = req.query;
  const db = getDb();

  const defaultLang = db.prepare('SELECT code FROM languages WHERE is_default = 1').get();
  const langCode = lang || (defaultLang ? defaultLang.code : 'tr');

  const categories = db.prepare(`
    SELECT
      c.id,
      c.image,
      c.sort_order,
      c.is_active,
      c.created_at,
      COALESCE(
        (SELECT ct.name FROM category_translations ct WHERE ct.category_id = c.id AND ct.language_code = ?),
        (SELECT ct.name FROM category_translations ct WHERE ct.category_id = c.id AND ct.language_code = (SELECT code FROM languages WHERE is_default = 1)),
        (SELECT ct.name FROM category_translations ct WHERE ct.category_id = c.id LIMIT 1)
      ) as name
    FROM categories c
    WHERE c.is_active = 1
    ORDER BY c.sort_order ASC, c.id ASC
  `).all(langCode);

  res.json(categories);
});

// GET /api/categories/all (admin - includes inactive)
router.get('/all', authenticateToken, (req, res) => {
  const { lang } = req.query;
  const db = getDb();

  const defaultLang = db.prepare('SELECT code FROM languages WHERE is_default = 1').get();
  const langCode = lang || (defaultLang ? defaultLang.code : 'tr');

  const categories = db.prepare(`
    SELECT
      c.id,
      c.image,
      c.sort_order,
      c.is_active,
      c.created_at,
      COALESCE(
        (SELECT ct.name FROM category_translations ct WHERE ct.category_id = c.id AND ct.language_code = ?),
        (SELECT ct.name FROM category_translations ct WHERE ct.category_id = c.id LIMIT 1)
      ) as name
    FROM categories c
    ORDER BY c.sort_order ASC, c.id ASC
  `).all(langCode);

  // Also fetch all translations for each category
  const translations = db.prepare(`
    SELECT ct.category_id, ct.language_code, ct.name
    FROM category_translations ct
  `).all();

  const categoriesWithTranslations = categories.map(cat => ({
    ...cat,
    translations: translations.filter(t => t.category_id === cat.id)
  }));

  res.json(categoriesWithTranslations);
});

// POST /api/categories
router.post('/', authenticateToken, (req, res) => {
  const { image, sort_order, is_active, translations } = req.body;

  if (!translations || Object.keys(translations).length === 0) {
    return res.status(400).json({ error: 'At least one translation is required' });
  }

  const db = getDb();

  try {
    const result = db.prepare(
      'INSERT INTO categories (image, sort_order, is_active) VALUES (?, ?, ?)'
    ).run(
      image || null,
      sort_order || 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    );

    const categoryId = result.lastInsertRowid;

    const insertTrans = db.prepare(
      'INSERT INTO category_translations (category_id, language_code, name) VALUES (?, ?, ?)'
    );

    for (const [langCode, name] of Object.entries(translations)) {
      if (name && name.trim()) {
        insertTrans.run(categoryId, langCode, name.trim());
      }
    }

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
    const catTranslations = db.prepare('SELECT * FROM category_translations WHERE category_id = ?').all(categoryId);

    res.status(201).json({ ...category, translations: catTranslations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { image, sort_order, is_active, translations } = req.body;

  const db = getDb();
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    db.prepare(`
      UPDATE categories SET image = ?, sort_order = ?, is_active = ? WHERE id = ?
    `).run(
      image !== undefined ? image : category.image,
      sort_order !== undefined ? sort_order : category.sort_order,
      is_active !== undefined ? (is_active ? 1 : 0) : category.is_active,
      id
    );

    if (translations) {
      const upsertTrans = db.prepare(`
        INSERT INTO category_translations (category_id, language_code, name)
        VALUES (?, ?, ?)
        ON CONFLICT(category_id, language_code) DO UPDATE SET name = excluded.name
      `);

      for (const [langCode, name] of Object.entries(translations)) {
        if (name && name.trim()) {
          upsertTrans.run(id, langCode, name.trim());
        }
      }
    }

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    const catTranslations = db.prepare('SELECT * FROM category_translations WHERE category_id = ?').all(id);

    res.json({ ...updated, translations: catTranslations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/reorder
router.put('/reorder', authenticateToken, (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const db = getDb();

  try {
    const update = db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?');
    const updateMany = db.transaction((items) => {
      for (const item of items) {
        update.run(item.sort_order, item.id);
      }
    });
    updateMany(items);

    res.json({ message: 'Categories reordered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
