import React from 'react';

export function ProgramList({ programs = [], onApply }) {
  if (programs.length === 0) {
    return <div style={{ color: 'var(--text-secondary)' }}>No programs scraped yet. Try hitting "Test Local Scrape".</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', paddingBottom: '1rem' }}>
      {programs.map(p => (
        <div key={p.id} className="glass-panel" style={{ padding: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}
             onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
             onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>{p.title}</h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)', flex: 1 }}>{p.description}</p>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="button-glow" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              onClick={() => onApply && onApply(p.url)}
            >
              Apply Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
