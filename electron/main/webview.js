const { BrowserView } = require('electron');

let currentView = null;
let activeResizeHandler = null; // 用于缓存当前活跃的窗口大小重算监听器以防内存泄漏

/**
 * 核心逻辑：精准清理已绑定的 BrowserView 实例以及窗口 resize 监听器
 */
function cleanup(mainWindow) {
  if (activeResizeHandler) {
    mainWindow.off('resize', activeResizeHandler);
    activeResizeHandler = null;
  }
  if (currentView) {
    try {
      mainWindow.removeBrowserView(currentView);
    } catch (e) {
      console.warn("清理 BrowserView 异常:", e.message);
    }
    currentView = null;
  }
}

/**
 * 创建内置浏览器视图，并完美实现大小自动适配
 */
function createBrowserView(mainWindow, url, MockBrowserViewClass = null) {
  // 先执行一次全面的视图与事件清理
  cleanup(mainWindow);

  const ViewClass = MockBrowserViewClass || BrowserView;
  const view = new ViewClass();
  currentView = view;
  mainWindow.setBrowserView(view);
  
  // 【关键修复】定义动态边界重算函数：窗口大小变更时，自动保持顶部 80px 留白并将剩余宽高完美适配当前视口
  const updateBounds = () => {
    if (currentView && !mainWindow.isDestroyed()) {
      const [width, height] = mainWindow.getContentSize();
      currentView.setBounds({ x: 0, y: 80, width, height: height - 80 });
    }
  };

  // 初始化设置一次边界
  updateBounds();

  // 【自适应适配】注册 resize 监听事件以实现实时动态重算自适应大小
  activeResizeHandler = updateBounds;
  mainWindow.on('resize', activeResizeHandler);
  
  view.webContents.loadURL(url);
  
  return view;
}

/**
 * 关闭内置浏览器视图并注销监听
 */
function closeBrowserView(mainWindow) {
  cleanup(mainWindow);
}

module.exports = { createBrowserView, closeBrowserView };
