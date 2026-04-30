const { initDb } = require('../electron/db');
const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'temp_db');

try {
  const db = initDb(testDir);
  const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const tables = rows.map(r => r.name);
  
  if (tables.includes('articles') && tables.includes('sources')) {
    console.log("PASS: Database init successful with tables created.");
  } else {
    console.error("FAIL: Tables not found.");
    process.exit(1);
  }
} catch (e) {
  console.error("FAIL:", e);
  process.exit(1);
} finally {
  // Cleanup
  const dbFile = path.join(testDir, 'data.sqlite');
  if (fs.existsSync(dbFile)) {
    // Force close DB connection before deleting file internally in better-sqlite3 but we don't have reference here.
    // So we just try to delete, if fails it's fine for simple test.
    try { fs.unlinkSync(dbFile); fs.rmdirSync(testDir); } catch(err){}
  }
}
