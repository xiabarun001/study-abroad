const { createBrowserView } = require('../../electron/main/webview');

describe('BrowserView Manager', () => {
  it('should export createBrowserView function', () => {
    expect(typeof createBrowserView).toBe('function');
  });

  it('createBrowserView should return a dummy view object', () => {
    const view = createBrowserView();
    expect(view).toBeDefined();
    expect(view.webContents).toBeDefined();
  });
});
