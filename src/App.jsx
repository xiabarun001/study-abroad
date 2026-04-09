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
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    if (window.electronAPI) {
      // Fetch an example safe RSS feed for testing (e.g. reddit/r/studyabroad or a university RSS)
      await window.electronAPI.forceScrape('https://www.studyinthestates.dhs.gov/blog.xml');
      await loadArticles();
    }
    setLoading(false);
  };

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>{t('app_title')} - {t('dashboard_title')}</h1>
        <div className="settings-panel">
          <select onChange={changeLanguage} value={i18n.language}>
            <option value="zh">中文 (Chinese)</option>
            <option value="en">English</option>
          </select>
          <button className="button-primary" onClick={handleRefresh} disabled={loading}>
            {loading ? '...' : t('force_refresh')}
          </button>
        </div>
      </header>

      <main>
        {loading && <p>{t('loading')}</p>}
        <DashboardGrid articles={articles} />
      </main>
    </div>
  );
}

export default App;
