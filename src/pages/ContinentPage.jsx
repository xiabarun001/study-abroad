import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ProgramList } from '../features/catalog/ProgramList';
import { AiAdvisorPanel } from '../features/advisor/AiAdvisorPanel';
import { supabase } from '../shared/db/supabase';

export function ContinentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { continentId } = useParams();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);

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
  }, []);

  const handleTestScrape = async () => {
    setLoading(true);
    if (window.electronAPI) {
      try {
        const dummyHtml = `<html><body><h1>Master of Design Engineering</h1><p>Harvard University.</p></body></html>`;
        const newProgram = await window.electronAPI.scrapeProgram(dummyHtml);
        const { error } = await supabase.from('programs').insert([{
          title: newProgram.title,
          description: newProgram.description,
          url: 'https://mde.harvard.edu'
        }]);
        if (error) throw error;
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
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="button-glow" onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', padding: '0.5rem 1rem' }}>
            ← Back to Map
          </button>
          <h1 style={{ margin: 0 }}>{t('app_title') || 'Study Abroad Compass'} - {continentId}</h1>
        </div>
        <div className="settings-panel">
          {browserOpen ? (
            <button className="button-glow" onClick={handleCloseExternal} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              ← Close Webview
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
