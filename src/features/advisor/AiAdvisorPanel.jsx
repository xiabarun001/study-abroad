import React, { useState } from 'react';

export function AiAdvisorPanel({ programs }) {
  const [profile, setProfile] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAi = async () => {
    if (!profile.trim()) return;
    if (!window.electronAPI) return;
    
    setLoading(true);
    setRecommendation(''); // clear previous
    try {
      const rec = await window.electronAPI.getAiRecommendation(profile, programs);
      setRecommendation(rec);
    } catch (err) {
      setRecommendation('Oops! AI encountered an error: ' + err.message + '\n\n(Did you configure the API Key in the main process?)');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      <h2 className="section-title">
        <span style={{ fontSize: '1.5rem' }}>✨</span> AI Copilot
      </h2>
      
      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--glass-border)' }}>
        {recommendation ? (
          <div className="animate-fade-in" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            <strong style={{ color: 'var(--accent-secondary)' }}>AI Advisor:</strong><br/>
            {recommendation}
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
            Tell me about your GPA, major, and goals, and I'll recommend the best programs for you!
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <textarea
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          placeholder="e.g. I have a 3.8 GPA in CS from Tsinghua, looking for AI master programs in the US or UK..."
          rows={3}
        />
        <button 
          className="button-glow" 
          onClick={handleAskAi} 
          disabled={loading || !profile.trim()}
          style={{ alignSelf: 'flex-end' }}
        >
          {loading ? 'Analyzing...' : 'Ask AI'}
        </button>
      </div>
    </div>
  );
}
