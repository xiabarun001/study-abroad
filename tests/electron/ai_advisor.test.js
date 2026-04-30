const { getAiRecommendation } = require('../../electron/main/ai_advisor');

describe('AI Advisor Engine', () => {
  it('should export getAiRecommendation function', () => {
    expect(typeof getAiRecommendation).toBe('function');
  });

  it('should build a valid prompt from user background', async () => {
    // We mock fetch globally to avoid actual network calls
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Mocked AI Recommendation' } }]
        }),
      })
    );

    const userProfile = { gpa: '3.8', major: 'CS' };
    const programs = [{ title: 'MS CS at Stanford' }];
    
    const result = await getAiRecommendation(userProfile, programs);
    
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result).toBe('Mocked AI Recommendation');
    
    // Cleanup
    global.fetch.mockRestore();
  });
});
