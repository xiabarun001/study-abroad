const { BrowserView, BrowserWindow } = require('electron');

let currentView = null;

function createBrowserView(mainWindow, url, MockBrowserViewClass = null) {
  if (currentView) {
    mainWindow.removeBrowserView(currentView);
    currentView = null;
  }

  const ViewClass = MockBrowserViewClass || BrowserView;
  const view = new ViewClass();
  currentView = view;
  mainWindow.setBrowserView(view);
  
  // We leave a 50px top margin so we can add a 'close' button in the main React UI, 
  // or we can just make it full screen and handle ESC.
  // For simplicity, let's make it cover the screen except the top 60px header.
  const [width, height] = mainWindow.getSize();
  view.setBounds({ x: 0, y: 80, width, height: height - 80 });
  
  // Auto resize
  view.setAutoResize({ width: true, height: true });
  
  view.webContents.loadURL(url);
  
  return view;
}

function closeBrowserView(mainWindow) {
  if (currentView) {
    mainWindow.removeBrowserView(currentView);
    currentView = null;
  }
}

module.exports = { createBrowserView, closeBrowserView };
