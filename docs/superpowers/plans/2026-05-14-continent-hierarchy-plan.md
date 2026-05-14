# Continent Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the map interface with a hierarchical navigation flow (Home -> Continents -> Countries -> Universities).

**Architecture:** Create Supabase tables for continents and countries, update the service layer to query these tables, and implement a grid-based UI for each level of the hierarchy using React Router.

**Tech Stack:** React, Tailwind CSS, Supabase, React Router

---

### Task 1: Database Migration Script

**Files:**
- Create: `supabase/migrations/20260514_continent_hierarchy.sql`

- [ ] **Step 1: Write the SQL script**

```sql
-- Create continents table
CREATE TABLE public.continents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create countries table
CREATE TABLE public.countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    continent_id UUID REFERENCES public.continents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add country_id to universities
ALTER TABLE public.universities
ADD COLUMN country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL;

-- Insert initial continents
INSERT INTO public.continents (name, slug, cover_image) VALUES
('北美洲', 'north-america', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800'),
('欧洲', 'europe', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=800'),
('亚洲', 'asia', 'https://images.unsplash.com/photo-1535139262971-c5184570f04f?auto=format&fit=crop&q=80&w=800'),
('大洋洲', 'oceania', 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&q=80&w=800');
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260514_continent_hierarchy.sql
git commit -m "chore: add db migration script for continent hierarchy"
```

### Task 2: Service Layer Updates

**Files:**
- Modify: `src/services/locationService.js`
- Modify: `src/services/universityService.js`

- [ ] **Step 1: Update locationService.js**

```javascript
import { supabase } from '../shared/db/supabase';
import { handleResponse } from './baseService';

export const locationService = {
  async getContinents() {
    return handleResponse(
      supabase.from('continents').select('*').order('name')
    );
  },

  async getCountriesByContinent(continentId) {
    return handleResponse(
      supabase.from('countries').select('*').eq('continent_id', continentId).order('name')
    );
  },

  async getCountryById(id) {
    return handleResponse(
      supabase.from('countries').select('*').eq('id', id).single()
    );
  }
};
```

- [ ] **Step 2: Update universityService.js**

```javascript
// Add this method to universityService object
  async getUniversitiesByCountry(countryId) {
    return handleResponse(
      supabase.from('universities').select('*').eq('country_id', countryId).order('name')
    );
  },
```

- [ ] **Step 3: Commit**

```bash
git add src/services/locationService.js src/services/universityService.js
git commit -m "feat: update service layer to fetch continents, countries, and universities hierarchically"
```

### Task 3: Home Page Refactor (Continents)

**Files:**
- Modify: `src/pages/MapPage.jsx` (will be renamed/refactored to HomePage)
- Modify: `src/App.jsx`

- [ ] **Step 1: Update MapPage.jsx content**

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationService } from '../services/locationService';

export function MapPage() {
  const navigate = useNavigate();
  const [continents, setContinents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContinents = async () => {
      try {
        const data = await locationService.getContinents();
        if (data) setContinents(data);
      } catch (err) {
        console.error("Failed to load continents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContinents();
  }, []);

  return (
    <div className="flex flex-col w-full h-full p-8 overflow-y-auto bg-slate-50">
      {/* Promo Banner */}
      <div className="w-full h-64 bg-indigo-600 rounded-3xl mb-12 flex items-center justify-center text-white shadow-lg overflow-hidden relative">
        <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1600" className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Study Abroad" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold mb-4 font-outfit">开启您的留学之旅</h1>
          <p className="text-xl opacity-90 font-inter">探索全球顶尖学府，成就无限可能</p>
        </div>
      </div>

      {/* Continents Grid */}
      <h2 className="text-2xl font-bold mb-6 font-outfit text-slate-800">选择大洲</h2>
      {loading ? (
        <div className="text-center py-10 text-slate-500">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {continents.map(continent => (
            <div 
              key={continent.id} 
              onClick={() => navigate(`/continent/${continent.id}`)}
              className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img src={continent.cover_image || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80'} alt={continent.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-white text-2xl font-bold font-outfit">{continent.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/MapPage.jsx
git commit -m "feat: refactor map page to home page with continents grid"
```

### Task 4: Continent Page Implementation

**Files:**
- Modify: `src/pages/ContinentPage.jsx`

- [ ] **Step 1: Rewrite ContinentPage.jsx**

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { locationService } from '../services/locationService';

export function ContinentPage() {
  const navigate = useNavigate();
  const { continentId } = useParams();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await locationService.getCountriesByContinent(continentId);
        if (data) setCountries(data);
      } catch (err) {
        console.error("Failed to load countries:", err);
      } finally {
        setLoading(false);
      }
    };
    if (continentId) fetchCountries();
  }, [continentId]);

  return (
    <div className="app-container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="button-glow" onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', padding: '0.5rem 1rem' }}>
            ← 返回首页
          </button>
          <h1 style={{ margin: 0 }}>探索国家</h1>
        </div>
      </header>

      <main className="main-layout bg-transparent border-none shadow-none mt-4">
        {loading ? (
          <div className="w-full flex justify-center py-20 text-slate-400">正在加载国家列表...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {countries.map(country => (
              <div 
                key={country.id} 
                onClick={() => navigate(`/country/${country.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="h-40 overflow-hidden">
                  <img src={country.cover_image || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80'} alt={country.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-slate-800 font-outfit">{country.name}</h3>
                </div>
              </div>
            ))}
            {countries.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-500">该大洲下暂无国家数据</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/ContinentPage.jsx
git commit -m "feat: implement continent page to display countries grid"
```

### Task 5: Country Page Implementation

**Files:**
- Modify: `src/pages/CountryPage.jsx`

- [ ] **Step 1: Rewrite CountryPage.jsx**

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { universityService } from '../services/universityService';
import { locationService } from '../services/locationService';

export function CountryPage() {
  const navigate = useNavigate();
  const { countryId } = useParams();
  const [universities, setUniversities] = useState([]);
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const countryData = await locationService.getCountryById(countryId);
        if (countryData) setCountry(countryData);
        
        const uniData = await universityService.getUniversitiesByCountry(countryId);
        if (uniData) setUniversities(uniData);
      } catch (err) {
        console.error("Failed to load country data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (countryId) fetchData();
  }, [countryId]);

  return (
    <div className="app-container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="button-glow" onClick={() => navigate(-1)} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', padding: '0.5rem 1rem' }}>
            ← 返回
          </button>
          <h1 style={{ margin: 0 }}>{country ? country.name : '探索大学'}</h1>
        </div>
      </header>

      <main className="main-layout bg-transparent border-none shadow-none mt-4">
        {loading ? (
          <div className="w-full flex justify-center py-20 text-slate-400">正在加载大学列表...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {universities.map(uni => (
              <div 
                key={uni.id} 
                onClick={() => navigate(`/university/${uni.id}`)}
                className="glass-panel cursor-pointer hover:shadow-xl transition-all hover:border-indigo-300"
                style={{ padding: '1.25rem' }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl flex-shrink-0">
                    {uni.name ? uni.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white m-0 leading-tight">{uni.name}</h3>
                    <p className="text-sm text-slate-400 m-0 mt-1">{uni.city || '未知城市'}</p>
                  </div>
                </div>
              </div>
            ))}
            {universities.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-500">该国家下暂无大学数据</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CountryPage.jsx
git commit -m "feat: implement country page to display universities list"
```
