function initCore(app, BrowserWindow) {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  return mainWindow;
}
module.exports = { initCore };
