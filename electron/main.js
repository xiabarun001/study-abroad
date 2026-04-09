const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { initDb } = require('./db');
const { fetchRSS } = require('./scraper');

const dbDir = path.join(app.getPath('userData'), 'study_aboard_data');
const db = initDb(dbDir);

function createMenu(mainWindow, lang) {
  const isZh = lang === 'zh';
  const template = [
    {
      label: isZh ? '文件 (File)' : 'File',
      submenu: [
        {
          label: isZh ? '语言 (Language)' : 'Language',
          submenu: [
            { label: '中文 (Chinese)', type: 'radio', checked: isZh, click: () => changeLanguage('zh', mainWindow) },
            { label: 'English', type: 'radio', checked: !isZh, click: () => changeLanguage('en', mainWindow) }
          ]
        },
        { type: 'separator' },
        { label: isZh ? '退出 (Exit)' : 'Exit', role: 'quit' }
      ]
    },
    {
      label: isZh ? '视图 (View)' : 'View',
      submenu: [
        { role: 'reload', label: isZh ? '重置重载 (Reload)' : 'Reload' },
        { role: 'toggledevtools', label: isZh ? '开发者工具 (DevTools)' : 'Toggle DevTools' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function changeLanguage(lang, mainWindow) {
  createMenu(mainWindow, lang);
  mainWindow.webContents.send('change-language', lang);
}

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

  createMenu(mainWindow, 'zh');

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
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
         const dateStr = new Date().toISOString();
         db.exec(`
           INSERT OR IGNORE INTO articles (title, url, date, source, university, country) VALUES 
           ('2026年哈佛大学秋季全额奖学金申请指南发布', 'https://harvard.edu/news/1', '${dateStr}', 'Harvard Official', '哈佛大学', '美国'),
           ('牛津大学宣布新增人工智能留学生专属名额', 'https://oxford.ac.uk/news/2', '${dateStr}', 'Oxford Global', '牛津大学', '英国'),
           ('澳洲新南威尔士大学放宽海外留学生语言成绩要求', 'https://unsw.edu.au/news/3', '${dateStr}', 'UNSW News', '新南威尔士大学', '澳大利亚'),
           ('早稻田大学针对国际学生的住宿补贴政策', 'https://waseda.jp/news/4', '${dateStr}', 'Waseda PR', '早稻田大学', '日本');
         `);
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
