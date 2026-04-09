const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  getArticles: () => ipcRenderer.invoke('get-articles'),
  forceScrape: (url) => ipcRenderer.invoke('force-scrape', url)
});
