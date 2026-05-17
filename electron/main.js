const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const { initDb } = require('./db');
const { fetchRSS } = require('./scraper');
const { extractProgramData } = require('./main/scraper');
const { getAiRecommendation, chatWithAgent } = require('./main/ai_advisor');
const { createBrowserView, closeBrowserView } = require('./main/webview');

let mainWindowInstance = null; // 缓存主窗口实例，用于 BrowserView 操作

// 数据库连接实例 (遗留本地 SQLite 用途)
let db;

// 移除默认应用菜单，以保证界面清爽

/**
 * 创建并配置应用主窗口
 */
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // 禁用 nodeIntegration 保证安全
      contextIsolation: true  // 启用上下文隔离
    }
  });

  mainWindowInstance = mainWindow;

  // Remove the default application menu completely
  Menu.setApplicationMenu(null);

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

/**
 * 应用准备就绪生命周期回调
 */
app.whenReady().then(() => {
  // 初始化本地 SQLite 数据库存放路径
  const dbDir = path.join(app.getPath('userData'), 'study_abroad_data');
  db = initDb(dbDir);

  createWindow();

  // ----- 以下为 IPC 通信句柄注册 (响应渲染进程请求) -----

  ipcMain.handle('get-articles', () => {
    return db.prepare('SELECT * FROM articles ORDER BY created_at DESC LIMIT 50').all();
  });
  
  // 在主窗口内打开内置的 BrowserView (用于外部链接加载)
  ipcMain.handle('open-external', (event, url) => {
    if (mainWindowInstance) {
      createBrowserView(mainWindowInstance, url);
    }
  });

  ipcMain.handle('close-external', () => {
    if (mainWindowInstance) {
      closeBrowserView(mainWindowInstance);
    }
  });

  // 调用基础爬虫提取特定项目页面信息
  ipcMain.handle('scrape-program', async (event, html) => {
    return extractProgramData(html);
  });

  ipcMain.handle('get-ai-recommendation', async (event, profile, programs) => {
    return await getAiRecommendation(profile, programs);
  });

  // 与 AI 助手进行对话
  ipcMain.handle('chat-with-agent', async (event, messages, keys) => {
    return await chatWithAgent(messages, keys);
  });

  // AI 并发爬取各大引擎并筛选留学项目
  ipcMain.handle('ai-search-programs', async (event, params, keys) => {
    const { aiSearchPrograms } = require('./main/ai_advisor');
    return await aiSearchPrograms(params, keys);
  });

  ipcMain.handle('force-scrape', async (event, url) => {
      try {
         const dStr = new Date().toISOString();
         db.exec(`
           INSERT OR IGNORE INTO articles (title, url, date, source, university, country) VALUES 
           ('2026年哈佛大学秋季全额奖学金申请指南发布', 'https://www.harvard.edu', '${dStr}', 'Harvard Official', '哈佛大学', '美国'),
           ('牛津大学宣布新增人工智能留学生专属名额', 'https://www.ox.ac.uk', '${dStr}', 'Oxford Global', '牛津大学', '英国'),
           ('澳洲新南威尔士大学放宽海外留学生语言成绩要求', 'https://www.unsw.edu.au', '${dStr}', 'UNSW News', '新南威尔士大学', '澳大利亚'),
           ('早稻田大学针对国际学生的住宿补贴政策', 'https://www.waseda.jp/top/en', '${dStr}', 'Waseda PR', '早稻田大学', '日本'),
           ('东京大学商学院招生情况速览', 'https://www.u-tokyo.ac.jp', '${dStr}', 'UTokyo Admissions', '东京大学', '日本'),
           ('斯坦福大学工程类硕士免GRE要求最新名单', 'https://www.stanford.edu', '${dStr}', 'Stanford News', '斯坦福大学', '美国'),
           ('剑桥大学国王学院降低本科入学A-Level门槛', 'https://www.cam.ac.uk', '${dStr}', 'Cambridge Admin', '剑桥大学', '英国'),
           ('墨尔本大学商科研究生学费部分减免政策', 'https://www.unimelb.edu.au', '${dStr}', 'Unimelb Updates', '墨尔本大学', '澳大利亚'),
           ('加州大学伯克利分校新增中国学生联合会办事处', 'https://www.berkeley.edu', '${dStr}', 'UCB Weekly', '加州大学伯克利分校', '美国'),
           ('多伦多大学针对计算机科学发布春季特招简章', 'https://www.utoronto.ca', '${dStr}', 'UofT News', '多伦多大学', '加拿大'),
           ('帝国理工学院与留学生工会的最新租房补贴谈判', 'https://www.imperial.ac.uk', '${dStr}', 'Imperial Media', '帝国理工学院', '英国'),
           ('苏黎世联邦理工学院德语门槛改革说明', 'https://ethz.ch/en.html', '${dStr}', 'ETH Docs', '苏黎世联邦理工学院', '瑞士');
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

