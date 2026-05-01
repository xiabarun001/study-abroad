const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  getArticles: () => ipcRenderer.invoke('get-articles'),
  forceScrape: (url) => ipcRenderer.invoke('force-scrape', url),
  onLanguageChange: (callback) => ipcRenderer.on('change-language', (event, lang) => callback(lang)),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  closeExternal: () => ipcRenderer.invoke('close-external'),
  scrapeProgram: (html) => ipcRenderer.invoke('scrape-program', html),
  getAiRecommendation: (profile, programs) => ipcRenderer.invoke('get-ai-recommendation', profile, programs)
});
