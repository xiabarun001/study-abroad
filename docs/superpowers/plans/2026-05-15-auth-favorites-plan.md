# Auth & Favorites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement user authentication via Supabase and allow users to favorite/save study-abroad programs.

**Architecture:** We will use Supabase Auth for identity and a `user_favorites` table with Row Level Security (RLS) to store saved programs. The UI will include a global Auth context, a Login Modal, a reusable Favorite button, and a dedicated Favorites Page.

**Tech Stack:** React, Tailwind CSS, Supabase Auth, React Router

---

### Task 1: Database Migration Script

**Files:**
- Create: `supabase/migrations/20260515_auth_favorites.sql`

- [ ] **Step 1: Write the SQL script**

```sql
-- Create user_favorites table
CREATE TABLE public.user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
ON public.user_favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.user_favorites FOR DELETE 
USING (auth.uid() = user_id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260515_auth_favorites.sql
git commit -m "chore: add db migration script for user favorites"
```

### Task 2: Auth Service and Context Provider

**Files:**
- Create: `src/services/authService.js`
- Create: `src/hooks/useAuth.jsx`

- [ ] **Step 1: Create authService.js**

```javascript
import { supabase } from '../shared/db/supabase';

export const authService = {
  async signUp(email, password) {
    return supabase.auth.signUp({ email, password });
  },
  async signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  },
  async signOut() {
    return supabase.auth.signOut();
  },
  async getSession() {
    return supabase.auth.getSession();
  },
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
```

- [ ] **Step 2: Create useAuth.jsx**

```javascript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext({ user: null, session: null, loading: true });

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 3: Wrap App in AuthProvider**
Modify `src/main.jsx` to wrap `<App />` with `<AuthProvider>`.

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n.js'
import { AuthProvider } from './hooks/useAuth.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
```

- [ ] **Step 4: Commit**

```bash
git add src/services/authService.js src/hooks/useAuth.jsx src/main.jsx
git commit -m "feat: implement auth service and context provider"
```

### Task 3: Login Modal & Header Integration

**Files:**
- Create: `src/components/LoginModal.jsx`
- Modify: `src/layouts/MainLayout.jsx`

- [ ] **Step 1: Create LoginModal.jsx**

```javascript
import React, { useState } from 'react';
import { authService } from '../services/authService';

export function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = isLogin 
        ? await authService.signIn(email, password)
        : await authService.signUp(email, password);
      
      if (authError) throw authError;
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-slate-900/90 border border-white/10 shadow-2xl rounded-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center font-outfit">
          {isLogin ? '登录账户' : '注册账户'}
        </h2>
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full button-glow font-bold py-3 mt-4">
            {loading ? '处理中...' : (isLogin ? '登 录' : '注 册')}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? '没有账号？' : '已有账号？'}
          <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-400 hover:text-indigo-300 ml-2 font-bold">
            {isLogin ? '立即注册' : '返回登录'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update MainLayout.jsx**

```javascript
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { LoginModal } from '../components/LoginModal';

export function MainLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogout = async () => {
    await authService.signOut();
    navigate('/');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 font-inter text-slate-800 overflow-hidden">
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 cursor-pointer" onClick={() => navigate('/')}>
            S
          </div>
          <h1 className="text-xl font-bold font-outfit text-slate-800 cursor-pointer" onClick={() => navigate('/')}>
            Study Abroad Compass
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button onClick={() => navigate('/favorites')} className="text-slate-600 hover:text-indigo-600 font-semibold px-4 py-2 transition-colors">
                ❤️ 我的收藏
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <span className="text-sm text-slate-500">{user.email}</span>
                <button onClick={handleLogout} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                  退出
                </button>
              </div>
            </>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="button-glow text-sm px-6 py-2">
              登 录
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <Outlet />
      </main>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/LoginModal.jsx src/layouts/MainLayout.jsx
git commit -m "feat: add login modal and integrate auth into layout header"
```

### Task 4: Favorite Service & Button Component

**Files:**
- Create: `src/services/favoriteService.js`
- Create: `src/components/FavoriteButton.jsx`
- Modify: `src/pages/ContinentPage.jsx` (to wrap programs with FavoriteButton if there are any, or just prepare the button for future use. For now, we assume we might add it to a program card). Note: since we don't have a Program detail page yet, we will create the button and the service now. We will use it on the `FavoritesPage`.

- [ ] **Step 1: Create favoriteService.js**

```javascript
import { supabase } from '../shared/db/supabase';
import { handleResponse } from './baseService';

export const favoriteService = {
  async getFavorites(userId) {
    return handleResponse(
      supabase
        .from('user_favorites')
        .select(`
          id,
          program_id,
          created_at,
          programs (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },

  async isFavorite(userId, programId) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // ignore no rows error
    return !!data;
  },

  async toggleFavorite(userId, programId, isCurrentlyFavorite) {
    if (isCurrentlyFavorite) {
      return handleResponse(
        supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('program_id', programId)
      );
    } else {
      return handleResponse(
        supabase
          .from('user_favorites')
          .insert([{ user_id: userId, program_id: programId }])
      );
    }
  }
};
```

- [ ] **Step 2: Create FavoriteButton.jsx**

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { favoriteService } from '../services/favoriteService';
import { LoginModal } from './LoginModal';

export function FavoriteButton({ programId }) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user && programId) {
      favoriteService.isFavorite(user.id, programId).then(setIsFav).catch(console.error);
    } else {
      setIsFav(false);
    }
  }, [user, programId]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      setShowLogin(true);
      return;
    }

    setLoading(true);
    try {
      await favoriteService.toggleFavorite(user.id, programId, isFav);
      setIsFav(!isFav);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleToggle} 
        disabled={loading}
        className={`p-2 rounded-full transition-all ${isFav ? 'bg-pink-100 text-pink-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
        title={isFav ? "取消收藏" : "加入收藏"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/services/favoriteService.js src/components/FavoriteButton.jsx
git commit -m "feat: add favorite service and reusable favorite button component"
```

### Task 5: Favorites Page Implementation

**Files:**
- Create: `src/pages/FavoritesPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create FavoritesPage.jsx**

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { favoriteService } from '../services/favoriteService';
import { FavoriteButton } from '../components/FavoriteButton';

export function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      try {
        const data = await favoriteService.getFavorites(user.id);
        if (data) setFavorites(data);
      } catch (err) {
        console.error("Failed to load favorites:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user]);

  if (authLoading || loading) return <div className="p-10 text-center text-slate-500">加载中...</div>;
  if (!user) return null;

  return (
    <div className="flex flex-col w-full h-full p-8 overflow-y-auto bg-slate-50">
      <h2 className="text-3xl font-bold mb-8 font-outfit text-slate-800 flex items-center gap-3">
        <span>❤️</span> 我的收藏
      </h2>
      
      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-lg mb-4">您还没有收藏任何项目</p>
          <button onClick={() => navigate('/')} className="button-glow px-6 py-2">
            去探索大学
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(fav => {
            const program = fav.programs;
            if (!program) return null;
            return (
              <div key={fav.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 relative group hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="absolute top-4 right-4 z-10">
                  <FavoriteButton programId={program.id} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 pr-10 mb-2 leading-tight">{program.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-4">{program.description || '暂无详细介绍'}</p>
                <div className="mt-auto flex justify-end">
                  {program.url && (
                    <a href={program.url} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold text-sm hover:underline">
                      查看详情 →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update App.jsx to include FavoritesPage route**

```javascript
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { MapPage } from './pages/MapPage';
import { ContinentPage } from './pages/ContinentPage';
import { CountryPage } from './pages/CountryPage';
import { UniversityPage } from './pages/UniversityPage';
import { FavoritesPage } from './pages/FavoritesPage';

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
          <Route path="/continent/:continentId" element={<ContinentPage />} />
          <Route path="/country/:countryId" element={<CountryPage />} />
          <Route path="/university/:id" element={<UniversityPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/FavoritesPage.jsx src/App.jsx
git commit -m "feat: implement favorites page and routing"
```
