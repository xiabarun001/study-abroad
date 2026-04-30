const React = require('react');

function AiAdvisorPanel() {
  const [profile, setProfile] = React.useState('');
  const [recommendation, setRecommendation] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleAskAi = async () => {
    if (!window.electronAPI) return;
    setLoading(true);
    try {
      const rec = await window.electronAPI.getAiRecommendation({ background: profile }, []);
      setRecommendation(rec);
    } catch (err) {
      setRecommendation('Error fetching recommendation: ' + err.message);
    }
    setLoading(false);
  };

  return React.createElement('div', { className: 'advisor-panel' },
    React.createElement('h2', null, 'AI Study Abroad Advisor'),
    React.createElement('textarea', {
      value: profile,
      onChange: (e) => setProfile(e.target.value),
      placeholder: 'Enter your background (e.g. GPA 3.8, CS major, 2 internships)...',
      rows: 4,
      cols: 50
    }),
    React.createElement('br', null),
    React.createElement('button', { onClick: handleAskAi, disabled: loading }, 
      loading ? 'Thinking...' : 'Get Recommendations'
    ),
    recommendation && React.createElement('div', { className: 'recommendation-result' },
      React.createElement('h3', null, 'AI Suggestion:'),
      React.createElement('p', null, recommendation)
    )
  );
}

module.exports = { AiAdvisorPanel };
