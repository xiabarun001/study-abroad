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
            <span className="font-semibold text-primary cursor-pointer">快速评测</span>
            <span className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">我的收藏</span>
            <span className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">系统设置</span>
          </nav>
        </div>
      </header>

      {/* Side Navigation */}
      <aside className="fixed left-0 top-20 bottom-0 w-64 backdrop-blur-md bg-white/95 border-r border-outline-variant z-30 px-6 py-8 overflow-y-auto flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <ul className="space-y-2">
              <li>
                <div onClick={() => navigate('/')} className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold cursor-pointer transition-colors">
                  <span>🏠 首页</span>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="mb-8">
            <p className="text-xs text-slate-400 mb-4 tracking-wider pl-4">🌍 大洲</p>
            <ul className="space-y-1">
              <li>
                <div onClick={() => handleContinentClick('north-america')} className="flex items-center gap-3 px-8 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <span>北美洲</span>
                </div>
              </li>
              <li>
                <div onClick={() => handleContinentClick('europe')} className="flex items-center gap-3 px-8 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <span>欧洲</span>
                </div>
              </li>
              <li>
                <div onClick={() => handleContinentClick('asia')} className="flex items-center gap-3 px-8 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <span>亚洲</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-auto">
           <div className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-semibold cursor-pointer transition-colors border border-indigo-100">
             <span>🤖 AI 助手</span>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 pt-20 h-screen flex flex-col overflow-hidden">
        <div className="flex-1 relative bg-slate-50">
          {/* Map Image (Use a generic placeholder map or CSS block) */}
          <div className="absolute inset-0 z-0 flex items-center justify-center p-10">
            <div className="w-full h-full bg-sky-100/60 rounded-3xl flex items-center justify-center text-sky-800 font-medium">
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
