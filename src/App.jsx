import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MapPage } from './pages/MapPage';
import { ContinentPage } from './pages/ContinentPage';
import { CountryPage } from './pages/CountryPage';
import { UniversityPage } from './pages/UniversityPage';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onLanguageChange) {
      window.electronAPI.onLanguageChange((lang) => {
        i18n.changeLanguage(lang);
      });
    }
  }, [i18n]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/continent/:continentId" element={<ContinentPage />} />
        <Route path="/country/:countryId" element={<CountryPage />} />
        <Route path="/university/:id" element={<UniversityPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
