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
