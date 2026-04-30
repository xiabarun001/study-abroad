function createBrowserView(BrowserViewClass) {
  // Mock implementation for test/architecture setup
  if (BrowserViewClass) {
    return new BrowserViewClass();
  }
  return {
    webContents: {
      loadURL: (url) => Promise.resolve()
    }
  };
}

module.exports = { createBrowserView };
