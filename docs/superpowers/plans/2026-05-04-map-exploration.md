# Map Exploration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the frontend to use a Tailwind CSS-powered interactive global map as the landing page, and route to the existing dual-column list view when an continent is clicked.

**Architecture:** Use `react-router-dom` with a `HashRouter` (best for Electron). Install and configure Tailwind CSS via Vite. Extract existing `App.jsx` layout into `ContinentPage.jsx`, and create `MapPage.jsx` using the new HTML map layout.

**Tech Stack:** React, Tailwind CSS, react-router-dom, Vite, Electron

---

### Task 1: Setup Tailwind CSS

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Modify: `src/index.css`
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**
```bash
npm install -D tailwindcss postcss autoprefixer
```

- [ ] **Step 2: Initialize Tailwind config**
```bash
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind theme and content**
Write the following into `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-bright": "#fbf8ff",
        "primary": "#24389c",
        "secondary-container": "#33a0fd",
        "inverse-surface": "#2f3037",
        "on-primary-fixed": "#00105c",
        "on-background": "#1a1b22",
        "surface-container-low": "#f4f2fc",
        "on-tertiary-fixed-variant": "#005313",
        "background": "#fbf8ff",
        "surface-container-lowest": "#ffffff",
        "on-primary-container": "#cacfff",
        "outline": "#757684",
        "on-error": "#ffffff",
        "error": "#ba1a1a",
        "primary-fixed-dim": "#bac3ff",
        "primary-fixed": "#dee0ff",
        "on-secondary": "#ffffff",
        "surface-container-high": "#e9e7f0",
        "on-primary-fixed-variant": "#293ca0",
        "on-primary": "#ffffff",
        "surface-container-highest": "#e3e1ea",
        "secondary-fixed-dim": "#9ecaff",
        "surface-variant": "#e3e1ea",
        "on-secondary-fixed-variant": "#00497d",
        "surface-tint": "#4355b9",
        "primary-container": "#3f51b5",
        "on-secondary-fixed": "#001d36",
        "surface": "#fbf8ff",
        "inverse-on-surface": "#f2eff9",
        "inverse-primary": "#bac3ff",
        "on-secondary-container": "#00355c",
        "error-container": "#ffdad6",
        "secondary": "#0061a4",
        "tertiary-container": "#00691b",
        "outline-variant": "#c5c5d4",
        "tertiary-fixed": "#94f990",
        "tertiary": "#004e11",
        "on-surface-variant": "#454652",
        "on-surface": "#1a1b22",
        "on-tertiary": "#ffffff",
        "secondary-fixed": "#d1e4ff",
        "on-tertiary-container": "#83e881",
        "on-tertiary-fixed": "#002204",
        "surface-dim": "#dbd9e2",
        "on-error-container": "#93000a",
        "tertiary-fixed-dim": "#78dc77",
        "surface-container": "#efedf6"
      }
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Inject Tailwind into CSS**
Prepend to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Commit**
```bash
git add package.json package-lock.json tailwind.config.js postcss.config.js src/index.css
git commit -m "build: configure tailwind css with custom theme"
```

---

### Task 2: Add Routing Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install React Router**
```bash
npm install react-router-dom
```

- [ ] **Step 2: Commit**
```bash
git add package.json package-lock.json
git commit -m "build: install react-router-dom"
```

---

### Task 3: Extract ContinentPage Component

**Files:**
- Create: `src/pages/ContinentPage.jsx`

- [ ] **Step 1: Write `ContinentPage.jsx`**
Extract the inner logic from `App.jsx` into `ContinentPage.jsx`:
```javascript
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
```

- [ ] **Step 2: Commit**
```bash
git add src/pages/ContinentPage.jsx
git commit -m "refactor: extract ContinentPage logic from App.jsx"
```

---

### Task 4: Create MapPage Component

**Files:**
- Create: `src/pages/MapPage.jsx`

- [ ] **Step 1: Write `MapPage.jsx`**
```javascript
import React from 'react';
import { useNavigate } from 'react-router-dom';

export function MapPage() {
  const navigate = useNavigate();

  const handleContinentClick = (id) => {
    navigate(`/continent/${id}`);
  };

  return (
    <div className="text-on-background bg-surface-bright min-h-screen font-sans">
      {/* Top Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest border-b border-outline-variant px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-primary">留学通 <span className="text-sm font-normal text-outline ml-2">Horizon Ethos</span></h1>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            <span className="font-semibold text-primary cursor-pointer">全球排名</span>
            <span className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">院校百科</span>
            <span className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">奖学金</span>
          </nav>
        </div>
      </header>

      {/* Side Navigation */}
      <aside className="fixed left-0 top-20 bottom-0 w-64 backdrop-blur-md bg-white/80 border-r border-outline-variant z-30 px-6 py-8 overflow-y-auto">
        <div className="mb-10">
          <p className="text-xs text-outline mb-4 uppercase tracking-wider">核心工具</p>
          <ul className="space-y-2">
            <li>
              <div className="flex items-center gap-3 px-4 py-3 bg-primary-container/10 text-primary rounded-xl font-semibold cursor-pointer">
                <span>探索全球</span>
              </div>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 pt-20 h-screen flex flex-col overflow-hidden">
        <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_#f4f2fc_0%,_#fbf8ff_100%)]">
          {/* Map Image (Use a generic placeholder map or CSS block) */}
          <div className="absolute inset-0 z-0 flex items-center justify-center p-10">
            <div className="w-full h-full bg-slate-200/50 rounded-3xl flex items-center justify-center text-slate-400">
               [Interactive Global Map Loading...]
            </div>
          </div>
          
          {/* Interactive Continent Tags Layer */}
          <div className="absolute inset-0 z-10 p-20 grid grid-cols-12 grid-rows-6">
            {/* North America */}
            <div className="col-start-2 row-start-2 group cursor-pointer" onClick={() => handleContinentClick('north-america')}>
              <div className="flex flex-col items-center">
                <div className="bg-surface-container-lowest shadow-xl rounded-full px-4 py-2 border border-outline-variant flex items-center gap-2 hover:scale-110 transition-transform">
                  <span className="text-sm font-bold">北美洲</span>
                </div>
              </div>
            </div>
            
            {/* Europe */}
            <div className="col-start-6 row-start-2 group cursor-pointer" onClick={() => handleContinentClick('europe')}>
              <div className="flex flex-col items-center">
                <div className="bg-surface-container-lowest shadow-xl rounded-full px-4 py-2 border border-outline-variant flex items-center gap-2 hover:scale-110 transition-transform">
                  <span className="text-sm font-bold">欧洲</span>
                </div>
              </div>
            </div>
            
            {/* Asia */}
            <div className="col-start-9 row-start-2 group cursor-pointer" onClick={() => handleContinentClick('asia')}>
              <div className="flex flex-col items-center">
                <div className="bg-surface-container-lowest shadow-xl rounded-full px-4 py-2 border border-outline-variant flex items-center gap-2 hover:scale-110 transition-transform">
                  <span className="text-sm font-bold">亚洲</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/pages/MapPage.jsx
git commit -m "feat: add MapPage with interactive continent routing"
```

---

### Task 5: Wire Routing in App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Rewrite `App.jsx` to Use Routing**
```javascript
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MapPage } from './pages/MapPage';
import { ContinentPage } from './pages/ContinentPage';

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
```

- [ ] **Step 2: Run dev server**
Ensure the app compiles.
```bash
npm run dev
```
Wait to verify it starts and renders correctly.

- [ ] **Step 3: Commit**
```bash
git add src/App.jsx
git commit -m "feat: implement HashRouter and connect pages"
```
