const React = require('react');

function ProgramList({ programs = [] }) {
  return React.createElement('div', { className: 'program-list' },
    programs.map(p => 
      React.createElement('div', { key: p.id, className: 'program-card' },
        React.createElement('h3', null, p.title),
        React.createElement('button', { 
          onClick: () => window.electronAPI && window.electronAPI.openExternal(p.url) 
        }, 'Apply Now')
      )
    )
  );
}

module.exports = { ProgramList };
