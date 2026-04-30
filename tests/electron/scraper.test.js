const { fetchPrograms } = require('../../electron/main/scraper');

describe('Scraper Engine', () => {
  it('should export fetchPrograms function', () => {
    expect(typeof fetchPrograms).toBe('function');
  });

  it('fetchPrograms should return a promise', () => {
    const result = fetchPrograms('dummy-url');
    expect(result).toBeInstanceOf(Promise);
  });
});
