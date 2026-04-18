const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const authenticateToken = require('../middleware/auth');

function loadAllergensForItems(db, itemIds) {
  const map = new Map();
  if (!itemIds.length) return map;
  const placeholders = itemIds.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT mia.menu_item_id AS menu_item_id, a.id, a.title, a.icon
    FROM menu_item_allergens mia
    JOIN allergens a ON a.id = mia.allergen_id
    WHERE mia.menu_item_id IN (${placeholders})
    ORDER BY a.sort_order ASC, a.id ASC
  `).all(...itemIds);
  for (const row of rows) {
    const mid = row.menu_item_id;
    if (!map.has(mid)) map.set(mid, []);
    map.get(mid).push({ id: row.id, title: row.title, icon: row.icon });
  }
  return map;
}

function attachAllergens(db, items) {
  const ids = items.map((i) => i.id);
  const map = loadAllergensForItems(db, ids);
  return items.map((item) => ({
    ...item,
    allergens: map.get(item.id) || [],
  }));
}

function setMenuItemAllergens(db, menuItemId, allergenIds) {
  db.prepare('DELETE FROM menu_item_allergens WHERE menu_item_id = ?').run(menuItemId);
  if (!allergenIds || !allergenIds.length) return;
  const insert = db.prepare(
    'INSERT INTO menu_item_allergens (menu_item_id, allergen_id) VALUES (?, ?)'
  );
  const check = db.prepare('SELECT id FROM allergens WHERE id = ?');
  for (const rawId of allergenIds) {
    const aid = parseInt(rawId, 10);
    if (!Number.isFinite(aid)) continue;
    if (check.get(aid)) insert.run(menuItemId, aid);
  }
}

// GET /api/menu-items?category_id=1&lang=tr
router.get('/', (req, res) => {
  const { category_id, lang } = req.query;
  const db = getDb();

  const defaultLang = db.prepare('SELECT code FROM languages WHERE is_default = 1').get();
  const langCode = lang || (defaultLang ? defaultLang.code : 'tr');

  let query = `
    SELECT
      mi.id,
      mi.category_id,
      mi.image,
      mi.price,
      mi.is_featured,
      mi.is_active,
      mi.sort_order,
      mi.created_at,
      COALESCE(
        (SELECT mit.name FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id AND mit.language_code = ?),
        (SELECT mit.name FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id AND mit.language_code = (SELECT code FROM languages WHERE is_default = 1)),
        (SELECT mit.name FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id LIMIT 1)
      ) as name,
      COALESCE(
        (SELECT mit.description FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id AND mit.language_code = ?),
        (SELECT mit.description FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id AND mit.language_code = (SELECT code FROM languages WHERE is_default = 1)),
        (SELECT mit.description FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id LIMIT 1)
      ) as description
    FROM menu_items mi
    WHERE mi.is_active = 1
  `;

  const params = [langCode, langCode];

  if (category_id) {
    query += ' AND mi.category_id = ?';
    params.push(category_id);
  }

  query += ' ORDER BY mi.sort_order ASC, mi.id ASC';

  const items = db.prepare(query).all(...params);
  res.json(attachAllergens(db, items));
});

// GET /api/menu-items/all (admin)
router.get('/all', authenticateToken, (req, res) => {
  const { category_id, lang } = req.query;
  const db = getDb();

  const defaultLang = db.prepare('SELECT code FROM languages WHERE is_default = 1').get();
  const langCode = lang || (defaultLang ? defaultLang.code : 'tr');

  let query = `
    SELECT
      mi.id,
      mi.category_id,
      mi.image,
      mi.price,
      mi.is_featured,
      mi.is_active,
      mi.sort_order,
      mi.created_at,
      COALESCE(
        (SELECT mit.name FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id AND mit.language_code = ?),
        (SELECT mit.name FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id LIMIT 1)
      ) as name,
      COALESCE(
        (SELECT mit.description FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id AND mit.language_code = ?),
        (SELECT mit.description FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id LIMIT 1)
      ) as description,
      (SELECT ct.name FROM category_translations ct WHERE ct.category_id = mi.category_id AND ct.language_code = ?) as category_name
    FROM menu_items mi
  `;

  const params = [langCode, langCode, langCode];

  if (category_id) {
    query += ' WHERE mi.category_id = ?';
    params.push(category_id);
  }

  query += ' ORDER BY mi.sort_order ASC, mi.id ASC';

  const items = db.prepare(query).all(...params);

  // Fetch translations for each item
  const translations = db.prepare(`
    SELECT mit.menu_item_id, mit.language_code, mit.name, mit.description
    FROM menu_item_translations mit
  `).all();

  const itemsWithTranslations = items.map(item => ({
    ...item,
    translations: translations.filter(t => t.menu_item_id === item.id)
  }));

  res.json(attachAllergens(db, itemsWithTranslations));
});

// GET /api/menu-items/featured?lang=tr
router.get('/featured', (req, res) => {
  const { lang } = req.query;
  const db = getDb();

  const defaultLang = db.prepare('SELECT code FROM languages WHERE is_default = 1').get();
  const langCode = lang || (defaultLang ? defaultLang.code : 'tr');

  const items = db.prepare(`
    SELECT
      mi.id,
      mi.category_id,
      mi.image,
      mi.price,
      mi.is_featured,
      mi.is_active,
      mi.sort_order,
      mi.created_at,
      COALESCE(
        (SELECT mit.name FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id AND mit.language_code = ?),
        (SELECT mit.name FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id LIMIT 1)
      ) as name,
      COALESCE(
        (SELECT mit.description FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id AND mit.language_code = ?),
        (SELECT mit.description FROM menu_item_translations mit WHERE mit.menu_item_id = mi.id LIMIT 1)
      ) as description
    FROM menu_items mi
    WHERE mi.is_featured = 1 AND mi.is_active = 1
    ORDER BY mi.sort_order ASC, mi.id ASC
  `).all(langCode, langCode);

  res.json(attachAllergens(db, items));
});

// POST /api/menu-items
router.post('/', authenticateToken, (req, res) => {
  const { category_id, image, price, is_featured, is_active, sort_order, translations, allergen_ids } = req.body;

  if (!category_id) {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  if (!translations || Object.keys(translations).length === 0) {
    return res.status(400).json({ error: 'At least one translation is required' });
  }

  const db = getDb();

  try {
    const result = db.prepare(`
      INSERT INTO menu_items (category_id, image, price, is_featured, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      category_id,
      image || null,
      price || 0,
      is_featured ? 1 : 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      sort_order || 0
    );

    const itemId = result.lastInsertRowid;

    const insertTrans = db.prepare(`
      INSERT INTO menu_item_translations (menu_item_id, language_code, name, description)
      VALUES (?, ?, ?, ?)
    `);

    for (const [langCode, trans] of Object.entries(translations)) {
      if (trans && trans.name && trans.name.trim()) {
        insertTrans.run(itemId, langCode, trans.name.trim(), trans.description || null);
      }
    }

    setMenuItemAllergens(db, itemId, allergen_ids);

    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(itemId);
    const itemTranslations = db.prepare('SELECT * FROM menu_item_translations WHERE menu_item_id = ?').all(itemId);
    const [withAllergens] = attachAllergens(db, [{ ...item, translations: itemTranslations }]);

    res.status(201).json(withAllergens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/menu-items/:id
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { category_id, image, price, is_featured, is_active, sort_order, translations, allergen_ids } = req.body;

  const db = getDb();
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
  if (!item) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  try {
    db.prepare(`
      UPDATE menu_items SET
        category_id = ?,
        image = ?,
        price = ?,
        is_featured = ?,
        is_active = ?,
        sort_order = ?
      WHERE id = ?
    `).run(
      category_id !== undefined ? category_id : item.category_id,
      image !== undefined ? image : item.image,
      price !== undefined ? price : item.price,
      is_featured !== undefined ? (is_featured ? 1 : 0) : item.is_featured,
      is_active !== undefined ? (is_active ? 1 : 0) : item.is_active,
      sort_order !== undefined ? sort_order : item.sort_order,
      id
    );

    if (translations) {
      const upsertTrans = db.prepare(`
        INSERT INTO menu_item_translations (menu_item_id, language_code, name, description)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(menu_item_id, language_code) DO UPDATE SET
          name = excluded.name,
          description = excluded.description
      `);

      for (const [langCode, trans] of Object.entries(translations)) {
        if (trans && trans.name && trans.name.trim()) {
          upsertTrans.run(id, langCode, trans.name.trim(), trans.description || null);
        }
      }
    }

    if (allergen_ids !== undefined) {
      setMenuItemAllergens(db, id, allergen_ids);
    }

    const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    const itemTranslations = db.prepare('SELECT * FROM menu_item_translations WHERE menu_item_id = ?').all(id);
    const [withAllergens] = attachAllergens(db, [{ ...updated, translations: itemTranslations }]);

    res.json(withAllergens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/menu-items/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
  if (!item) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  try {
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
