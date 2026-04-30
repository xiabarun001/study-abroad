async function getAiRecommendation(userProfile, programs) {
  const apiUrl = process.env.VITE_AI_API_URL || 'https://api.deepseek.com/v1/chat/completions';
  const apiKey = process.env.VITE_AI_API_KEY || 'dummy_key';

  const prompt = `User Profile: ${JSON.stringify(userProfile)}. Available Programs: ${JSON.stringify(programs)}. Please recommend the best fit.`;

  const payload = {
    model: 'deepseek-chat', // Generic generic placeholder
    messages: [
      { role: 'system', content: 'You are a helpful study abroad advisor.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  };

  try {
    // In a Node environment without global fetch, we might need to use node-fetch or similar, 
    // but Node 18+ has native fetch. Electron's Node integration supports fetch.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    throw error;
  }
}

module.exports = { getAiRecommendation };
