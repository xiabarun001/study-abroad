import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGrid from './components/DashboardGrid';

function App() {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadArticles = async () => {
    if (window.electronAPI) {
      try {
        const data = await window.electronAPI.getArticles();
        setArticles(data || []);
      } catch(err) {
        console.error("Error loading articles", err);
      }
    }
  };

  useEffect(() => {
    loadArticles();
    if (window.electronAPI && window.electronAPI.onLanguageChange) {
      window.electronAPI.onLanguageChange((lang) => {
        i18n.changeLanguage(lang);
      });
    }
  }, [i18n]);

  const handleRefresh = async () => {
    setLoading(true);
    if (window.electronAPI) {
      await window.electronAPI.forceScrape('https://www.studyinthestates.dhs.gov/blog.xml');
      await loadArticles();
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <header className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>{t('app_title')}</h1>
        <div className="settings-panel">
          <button className="button-primary" onClick={handleRefresh} disabled={loading}>
            {loading ? '...' : t('force_refresh')}
          </button>
        </div>
      </header>

      <main>
        {loading && <p style={{textAlign: 'center'}}>{t('loading')}</p>}
        <DashboardGrid articles={articles} />
      </main>
    </div>
  );
}

export default App;
