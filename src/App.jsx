import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { MapPage } from './pages/MapPage';
import { ContinentPage } from './pages/ContinentPage';
import { CountryPage } from './pages/CountryPage';
import { UniversityPage } from './pages/UniversityPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { AiAdvisorPage } from './pages/AiAdvisorPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ApplicationHubPage } from './pages/ApplicationHubPage'; // 引入新建的申请中心门户页面

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
        <Route element={<MainLayout />}>
          <Route path="/" element={<MapPage />} />
          {/* 项目大全：改为空 Fragment 占位，由 MainLayout 进行常驻渲染控制显隐 */}
          <Route path="/discover" element={<></>} />
          <Route path="/continent/:continentId" element={<ContinentPage />} />
          <Route path="/country/:countryId" element={<CountryPage />} />
          <Route path="/university/:id" element={<UniversityPage />} />
          {/* 申请中心大盘：改为空 Fragment 占位，由 MainLayout 进行常驻渲染控制显隐 */}
          <Route path="/hub" element={<></>} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          {/* AI助手：改为空 Fragment 占位，由 MainLayout 进行常驻渲染控制显隐 */}
          <Route path="/advisor" element={<></>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
