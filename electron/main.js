const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initDb } = require('./db');
const { fetchRSS } = require('./scraper');

const dbDir = path.join(app.getPath('userData'), 'study_aboard_data');
const db = initDb(dbDir);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('get-articles', () => {
    return db.prepare('SELECT * FROM articles ORDER BY created_at DESC LIMIT 50').all();
  });

  ipcMain.handle('force-scrape', async (event, url) => {
      try {
         await fetchRSS(url, db);
         return { success: true };
      } catch(err) {
         return { success: false, error: err.message };
      }
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
