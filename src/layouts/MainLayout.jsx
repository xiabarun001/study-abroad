import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { LoginModal } from '../components/LoginModal';
import { ApiKeysModal } from '../components/ApiKeysModal';

/**
 * 整个应用的主体布局组件
 * 包含全局顶部导航栏(Header)，并将所有页面的具体内容渲染在下面的 <Outlet /> 中。
 */
export function MainLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  const handleLogout = async () => {
    await authService.signOut();
    navigate('/');
  };

  return (
    <div className="text-on-background bg-surface-bright min-h-screen font-sans">
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest border-b border-outline-variant px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="text-xl font-bold tracking-tight text-primary">留学通 <span className="text-sm font-normal text-outline ml-2">Horizon Ethos</span></h1>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            <span className="font-semibold text-primary cursor-pointer">快速评测</span>
            {user && (
              <>
                <span onClick={() => navigate('/applications')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">我的申请</span>
                <span onClick={() => navigate('/favorites')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">我的收藏</span>
              </>
            )}
            <button 
              onClick={() => setIsApiModalOpen(true)} 
              className="text-slate-400 hover:text-indigo-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-indigo-50"
              title="API Settings"
            >
              ⚙️
            </button>
            <button 
              onClick={() => navigate('/advisor')}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-full font-bold transition-colors text-sm"
            >
              <span>✨</span> AI 助手
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{user.email}</span>
              <button onClick={handleLogout} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                退出
              </button>
            </div>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="button-glow text-sm px-6 py-2" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white', borderRadius: '8px' }}>
              登 录
            </button>
          )}
        </div>
      </header>
      <main className="pt-20 h-screen w-screen overflow-hidden flex flex-col">
        <Outlet />
      </main>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ApiKeysModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />
    </div>
  );
}
