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
    <div className="text-slate-800 bg-slate-50 min-h-screen font-sans flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-indigo-600 text-white flex items-center justify-center rounded-lg font-bold text-xl group-hover:bg-indigo-700 transition-colors">H</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">留学通 <span className="text-sm font-medium text-slate-400 ml-1">Horizon</span></h1>
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <span onClick={() => navigate('/')} className="text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">发现项目</span>
            {user && (
              <>
                <span onClick={() => navigate('/applications')} className="text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">我的申请</span>
                <span onClick={() => navigate('/favorites')} className="text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">我的收藏</span>
              </>
            )}
            <div className="w-px h-4 bg-slate-200 mx-2"></div>
            <button 
              onClick={() => setIsApiModalOpen(true)} 
              className="text-slate-400 hover:text-indigo-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-indigo-50"
              title="API Settings"
            >
              ⚙️
            </button>
            <button 
              onClick={() => navigate('/advisor')}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-1.5 rounded-full font-bold transition-all hover:shadow-sm"
            >
              <span>✨</span> AI 助手
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200" title={user.email}>
                {user.email.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-500 font-medium transition-colors">
                退出
              </button>
            </div>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="text-sm px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-full shadow-sm transition-all hover:shadow">
              登录 / 注册
            </button>
          )}
        </div>
      </header>
      <main className="pt-16 flex-1 w-full overflow-hidden flex flex-col relative">
        <Outlet />
      </main>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ApiKeysModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />
    </div>
  );
}
