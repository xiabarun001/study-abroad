const { contextBridge, ipcRenderer } = require('electron');

/**
 * 预加载脚本 (Preload Script)
 * 在独立上下文 (Context Isolation) 开启的情况下，
 * 安全地将 Electron 主进程的特定 IPC 方法暴露给渲染进程 (React)
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // 基础连接测试
  ping: () => ipcRenderer.invoke('ping'),
  
  // 抓取并获取留学资讯文章列表 (遗留的 SQLite 示例)
  getArticles: () => ipcRenderer.invoke('get-articles'),
  forceScrape: (url) => ipcRenderer.invoke('force-scrape', url),
  
  // 监听多语言切换事件
  onLanguageChange: (callback) => ipcRenderer.on('change-language', (event, lang) => callback(lang)),
  
  // 通过 BrowserView 打开和关闭外部网页
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  closeExternal: () => ipcRenderer.invoke('close-external'),
  
  // 提取项目信息的抓取工具
  scrapeProgram: (html) => ipcRenderer.invoke('scrape-program', html),
  
  // 旧版 AI 推荐接口 (占位)
  getAiRecommendation: (profile, programs) => ipcRenderer.invoke('get-ai-recommendation', profile, programs),
  
  // 与 AI 留学顾问对话接口
  chatWithAgent: (messages, keys, options) => ipcRenderer.invoke('chat-with-agent', messages, keys, options),
  
  // 监听 AI 顾问的实时处理状态，并返回一个取消订阅函数，防止 React 重复监听导致内存泄漏
  onAgentStatus: (callback) => {
    const listener = (event, status) => callback(status);
    ipcRenderer.on('chat-agent-status', listener);
    return () => {
      ipcRenderer.removeListener('chat-agent-status', listener);
    };
  },

  // 监听 AI 顾问输出的流式文本数据片段，并返回取消订阅函数以防止内存泄漏
  onAgentChunk: (callback) => {
    const listener = (event, chunk) => callback(chunk);
    ipcRenderer.on('chat-agent-chunk', listener);
    return () => {
      ipcRenderer.removeListener('chat-agent-chunk', listener);
    };
  },
  
  // AI 实时搜索并提取留学项目
  aiSearchPrograms: (params, keys) => ipcRenderer.invoke('ai-search-programs', params, keys)
});
