jest.mock('electron', () => ({
  BrowserView: class {},
  BrowserWindow: class {}
}));

const { createBrowserView } = require('../../electron/main/webview');

class MockBrowserView {
  constructor() {
    this.webContents = {
      loadURL: jest.fn()
    };
  }
  setBounds() {}
  setAutoResize() {}
}

describe('BrowserView Manager', () => {
  it('should export createBrowserView function', () => {
    expect(typeof createBrowserView).toBe('function');
  });

  it('createBrowserView should return a view object', () => {
    const mockWindow = {
      setBrowserView: jest.fn(),
      removeBrowserView: jest.fn(),
      getSize: () => [1000, 800]
    };
    
    const view = createBrowserView(mockWindow, 'http://test.com', MockBrowserView);
    expect(view).toBeDefined();
    expect(view.webContents).toBeDefined();
    expect(mockWindow.setBrowserView).toHaveBeenCalledWith(view);
  });
});
