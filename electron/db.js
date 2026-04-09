const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function initDb(appPath) {
  // Ensure directory exists
  if (!fs.existsSync(appPath)) {
    fs.mkdirSync(appPath, { recursive: true });
  }

  const dbPath = path.join(appPath, 'data.sqlite');
  const db = new Database(dbPath);

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT UNIQUE,
      date TEXT,
      source TEXT,
      country TEXT,
      university TEXT,
      thumbnail TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      country TEXT,
      university TEXT,
      active INTEGER DEFAULT 1
    );
  `);

  return db;
}

module.exports = { initDb };
