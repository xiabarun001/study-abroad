import React from 'react';
import { useNavigate } from 'react-router-dom';

export function MapPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 w-full h-full min-h-screen bg-slate-900 relative overflow-hidden pt-16">
      {/* Dynamic Hero Section */}
      <div className="w-full flex-1 text-white relative flex flex-col justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=80" alt="Campus" className="w-full h-full object-cover opacity-20 object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
        </div>
        
        <div className="relative z-10 px-8 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 w-full">
          <div className="flex-1 space-y-6">
            <div className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-sm font-medium backdrop-blur-sm">
              🌟 开启 2026 申请季
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight font-outfit leading-tight text-white">
              定义您的<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">全球视野</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-xl leading-relaxed">
              Horizon 汇聚全球顶尖学府数据，提供一站式的选校、时间轴与申请看板管理。与 AI 顾问对话，即刻定制您的专属升学路线。
            </p>
            <div className="flex flex-row flex-wrap items-center gap-5 pt-8 w-full max-w-lg">
              <button onClick={() => navigate('/discover')} className="flex-1 min-w-[160px] px-8 py-4 bg-white hover:bg-slate-50 text-indigo-700 font-extrabold text-lg rounded-2xl transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2 group border border-white/50">
                项目大全
                <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-xl">🚀</span>
              </button>
              <button onClick={() => navigate('/advisor')} className="flex-1 min-w-[160px] px-8 py-4 bg-indigo-600/80 hover:bg-indigo-500 backdrop-blur-md text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-1 flex items-center justify-center gap-2 border border-indigo-400/40">
                <span className="text-xl">✨</span> AI 顾问
              </button>
            </div>
          </div>
          
          <div className="hidden md:block w-72 h-72 lg:w-[450px] lg:h-[450px] relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-[80px] opacity-40 animate-pulse"></div>
            <div className="absolute inset-4 border-2 border-white/10 rounded-full animate-[spin_30s_linear_infinite] border-dashed"></div>
            <div className="absolute inset-10 border border-indigo-400/20 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
            
            <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl shadow-2xl border border-white/20 relative z-10 overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <span className="text-[120px] lg:text-[160px] drop-shadow-[0_0_40px_rgba(255,255,255,0.5)] transform group-hover:scale-110 transition-transform duration-700">🌍</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
