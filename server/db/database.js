const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'qrmenu.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS languages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS category_translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      language_code TEXT NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      UNIQUE(category_id, language_code)
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      image TEXT,
      price REAL NOT NULL DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS menu_item_translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_item_id INTEGER NOT NULL,
      language_code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
      UNIQUE(menu_item_id, language_code)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS allergens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      icon TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_item_allergens (
      menu_item_id INTEGER NOT NULL,
      allergen_id INTEGER NOT NULL,
      PRIMARY KEY (menu_item_id, allergen_id),
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
      FOREIGN KEY (allergen_id) REFERENCES allergens(id) ON DELETE CASCADE
    );
  `);

  seedData();
}

function seedData() {
  const langCount = db.prepare('SELECT COUNT(*) as count FROM languages').get();
  if (langCount.count > 0) return;

  // Insert languages
  db.prepare("INSERT INTO languages (code, name, is_default, is_active) VALUES ('tr', 'Türkçe', 1, 1)").run();
  db.prepare("INSERT INTO languages (code, name, is_default, is_active) VALUES ('en', 'English', 0, 1)").run();

  // Insert admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare("INSERT INTO users (username, password) VALUES ('admin', ?)").run(hashedPassword);

  // Insert settings
  const settingsData = [
    ['company_name', 'Cafe QRMenu'],
    ['phone', '+90 555 000 0000'],
    ['address', 'İstanbul, Türkiye'],
    ['logo', ''],
    ['hero_image', ''],
    ['currency', '₺'],
  ];
  const insertSetting = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  settingsData.forEach(([key, value]) => insertSetting.run(key, value));

  // Insert categories
  const insertCategory = db.prepare("INSERT INTO categories (image, sort_order, is_active) VALUES (?, ?, 1)");
  const insertCategoryTrans = db.prepare("INSERT INTO category_translations (category_id, language_code, name) VALUES (?, ?, ?)");

  const cat1 = insertCategory.run(null, 1);
  insertCategoryTrans.run(cat1.lastInsertRowid, 'tr', 'Başlangıçlar');
  insertCategoryTrans.run(cat1.lastInsertRowid, 'en', 'Starters');

  const cat2 = insertCategory.run(null, 2);
  insertCategoryTrans.run(cat2.lastInsertRowid, 'tr', 'Ana Yemekler');
  insertCategoryTrans.run(cat2.lastInsertRowid, 'en', 'Main Courses');

  const cat3 = insertCategory.run(null, 3);
  insertCategoryTrans.run(cat3.lastInsertRowid, 'tr', 'İçecekler');
  insertCategoryTrans.run(cat3.lastInsertRowid, 'en', 'Beverages');

  // Insert menu items
  const insertItem = db.prepare("INSERT INTO menu_items (category_id, image, price, is_featured, is_active, sort_order) VALUES (?, ?, ?, ?, 1, ?)");
  const insertItemTrans = db.prepare("INSERT INTO menu_item_translations (menu_item_id, language_code, name, description) VALUES (?, ?, ?, ?)");

  // Starters
  const item1 = insertItem.run(cat1.lastInsertRowid, null, 85.00, 1, 1);
  insertItemTrans.run(item1.lastInsertRowid, 'tr', 'Mercimek Çorbası', 'Geleneksel Türk mercimek çorbası, limon ve kırmızı biber ile servis edilir.');
  insertItemTrans.run(item1.lastInsertRowid, 'en', 'Lentil Soup', 'Traditional Turkish lentil soup, served with lemon and red pepper.');

  const item2 = insertItem.run(cat1.lastInsertRowid, null, 120.00, 0, 2);
  insertItemTrans.run(item2.lastInsertRowid, 'tr', 'Ezme', 'Nar ekşisi ve baharatlarla hazırlanan acılı domates salatası.');
  insertItemTrans.run(item2.lastInsertRowid, 'en', 'Ezme Salad', 'Spicy tomato salad prepared with pomegranate molasses and spices.');

  const item3 = insertItem.run(cat1.lastInsertRowid, null, 95.00, 0, 3);
  insertItemTrans.run(item3.lastInsertRowid, 'tr', 'Humus', 'Nohut ezmesi, zeytinyağı ve susamlı tahin ile.');
  insertItemTrans.run(item3.lastInsertRowid, 'en', 'Hummus', 'Chickpea paste with olive oil and sesame tahini.');

  // Main Courses
  const item4 = insertItem.run(cat2.lastInsertRowid, null, 320.00, 1, 1);
  insertItemTrans.run(item4.lastInsertRowid, 'tr', 'Izgara Köfte', 'El yapımı ızgara köfte, pilav ve mevsim salatasıyla.');
  insertItemTrans.run(item4.lastInsertRowid, 'en', 'Grilled Meatballs', 'Handmade grilled meatballs with rice and seasonal salad.');

  const item5 = insertItem.run(cat2.lastInsertRowid, null, 380.00, 1, 2);
  insertItemTrans.run(item5.lastInsertRowid, 'tr', 'Tavuk Şiş', 'Marine edilmiş tavuk şiş, sebze ve pilav ile.');
  insertItemTrans.run(item5.lastInsertRowid, 'en', 'Chicken Skewer', 'Marinated chicken skewer with vegetables and rice.');

  const item6 = insertItem.run(cat2.lastInsertRowid, null, 450.00, 0, 3);
  insertItemTrans.run(item6.lastInsertRowid, 'tr', 'Kuzu Tandır', 'Fırında yavaş pişirilmiş kuzu eti, patates ve sebze ile.');
  insertItemTrans.run(item6.lastInsertRowid, 'en', 'Lamb Tandır', 'Slow roasted lamb in oven, with potatoes and vegetables.');

  // Beverages
  const item7 = insertItem.run(cat3.lastInsertRowid, null, 45.00, 0, 1);
  insertItemTrans.run(item7.lastInsertRowid, 'tr', 'Türk Çayı', 'Geleneksel demleme Türk çayı.');
  insertItemTrans.run(item7.lastInsertRowid, 'en', 'Turkish Tea', 'Traditional brewed Turkish tea.');

  const item8 = insertItem.run(cat3.lastInsertRowid, null, 60.00, 0, 2);
  insertItemTrans.run(item8.lastInsertRowid, 'tr', 'Türk Kahvesi', 'Geleneksel Türk kahvesi, lokum ile servis edilir.');
  insertItemTrans.run(item8.lastInsertRowid, 'en', 'Turkish Coffee', 'Traditional Turkish coffee, served with Turkish delight.');

  const item9 = insertItem.run(cat3.lastInsertRowid, null, 75.00, 1, 3);
  insertItemTrans.run(item9.lastInsertRowid, 'tr', 'Taze Sıkma Portakal Suyu', 'Taze sıkılmış portakal suyu.');
  insertItemTrans.run(item9.lastInsertRowid, 'en', 'Fresh Orange Juice', 'Freshly squeezed orange juice.');

  console.log('Database seeded successfully');
}

module.exports = { getDb };
