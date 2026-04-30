import React from 'react';

function ArticleCard({ entry }) {
  const handleClick = () => {
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal(entry.url);
    } else {
      window.open(entry.url, '_blank');
    }
  };

  return (
    <div className="card" onClick={handleClick} style={{cursor: 'pointer'}}>
      <h3 className="card-title">{entry.title}</h3>
      <div className="card-meta">
        <span>🏫 {entry.university || 'Generic'} {entry.country ? `(${entry.country})` : ''}</span>
        <span>🔗 {entry.source}</span>
        <span>📅 {new Date(entry.date).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default ArticleCard;
