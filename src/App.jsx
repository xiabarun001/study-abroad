import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ProgramList } from './features/catalog/ProgramList';
import { AiAdvisorPanel } from './features/advisor/AiAdvisorPanel';
import { supabase } from './shared/db/supabase';

function App() {
  const { t, i18n } = useTranslation();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);

  // Fetch data from Supabase
  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error.message);
    }
  };

  useEffect(() => {
    fetchPrograms();

    if (window.electronAPI && window.electronAPI.onLanguageChange) {
      window.electronAPI.onLanguageChange((lang) => {
        i18n.changeLanguage(lang);
      });
    }
  }, [i18n]);

  const handleTestScrape = async () => {
    setLoading(true);
    if (window.electronAPI) {
      try {
        const dummyHtml = `
          <html><body>
            <h1>Master of Design Engineering</h1>
            <p>Harvard University. A collaborative degree between GSD and SEAS.</p>
            <p>Deadline: January 5, 2027.</p>
          </body></html>
        `;
        const newProgram = await window.electronAPI.scrapeProgram(dummyHtml);
        
        // Insert into Supabase
        const { error } = await supabase
          .from('programs')
          .insert([
            {
              title: newProgram.title,
              description: newProgram.description,
              url: 'https://mde.harvard.edu'
            }
          ]);
          
        if (error) throw error;
        
        // Refresh the list from the cloud
        await fetchPrograms();
        
      } catch(err) {
        console.error("Scrape failed:", err);
      }
    }
    setLoading(false);
  };

  const handleOpenExternal = async (url) => {
    setBrowserOpen(true);
    if (window.electronAPI) {
      await window.electronAPI.openExternal(url);
    }
  };

  const handleCloseExternal = async () => {
    setBrowserOpen(false);
    if (window.electronAPI && window.electronAPI.closeExternal) {
      await window.electronAPI.closeExternal();
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>{t('app_title') || 'Study Abroad Compass'}</h1>
        <div className="settings-panel">
          {browserOpen ? (
            <button className="button-glow" onClick={handleCloseExternal} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              ← Back to App
            </button>
          ) : (
            <button className="button-glow" onClick={handleTestScrape} disabled={loading}>
              {loading ? 'Scraping...' : 'Test Local Scrape'}
            </button>
          )}
        </div>
      </header>

      <main className="main-layout" style={{ opacity: browserOpen ? 0.3 : 1, pointerEvents: browserOpen ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
        <section className="glass-panel catalog-section animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="section-title">Program Catalog</h2>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
             <ProgramList programs={programs} onApply={handleOpenExternal} />
          </div>
        </section>
        
        <section className="glass-panel advisor-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <AiAdvisorPanel programs={programs} />
        </section>
      </main>
    </div>
  );
}

export default App;
