const { initCore } = require('../../electron/main/core');
describe('Core Init', () => {
  it('should export initCore function', () => {
    expect(typeof initCore).toBe('function');
  });
});
