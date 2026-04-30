const { extractProgramData } = require('../../electron/main/scraper');

describe('Scraper Engine - Generic Extraction', () => {
  it('should extract title and description from generic HTML', () => {
    const mockHtml = `
      <html>
        <body>
          <h1>Master of Science in Computer Science</h1>
          <div class="content">
            <p>This program is designed for students with a background in engineering.</p>
            <p><strong>Deadline:</strong> December 15, 2026</p>
          </div>
        </body>
      </html>
    `;
    
    const result = extractProgramData(mockHtml);
    expect(result.title).toBe('Master of Science in Computer Science');
    expect(result.description).toContain('This program is designed');
    expect(result.description).toContain('December 15, 2026');
  });
});
