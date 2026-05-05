import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function UniversityPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Bento */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-between border border-slate-100">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              ←
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                U{id}
              </div>
              <div>
                <h1 className="font-black text-2xl tracking-tight text-slate-800">斯坦福大学</h1>
                <p className="text-sm text-slate-500 font-medium">Stanford University • 加利福尼亚, 美国</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm border border-yellow-200">
               QS排名 #3
             </div>
             <button className="bg-slate-800 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-slate-700 transition-colors">
               ⭐ 收藏
             </button>
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Hero Media Bento (Spans 2 columns) */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl relative overflow-hidden shadow-sm min-h-[320px] group cursor-pointer">
            <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/0 transition-colors"></div>
            {/* Fallback pattern if no image */}
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGMtNS41IDAtMTAgNC41LTEwIDEwczQuNSAxMCAxMCAxMCAxMC00LjUgMTAtMTAtNC41LTEwLTEwLTEwem0wLTIwYy01LjUgMC0xMCA0LjUtMTAgMTBzNC41IDEwIDEwIDEwIDEwLTQuNSAxMC0xMC00LjUtMTAtMTAtMTB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')]"></div>
            
            <div className="absolute bottom-6 left-6 text-white">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3">
                ▶
              </div>
              <h2 className="font-bold text-2xl tracking-tight">探索校园风采</h2>
              <p className="text-sm text-slate-300 mt-1">观看 3 分钟官方宣传片</p>
            </div>
          </div>
          
          {/* Right Column Stats */}
          <div className="flex flex-col gap-6">
            
            {/* Tuition Bento */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:-translate-y-1 transition-transform cursor-pointer">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">平均本科学费</p>
                <p className="text-3xl font-black text-slate-800 mt-2">$62,000<span className="text-sm text-slate-400 font-medium tracking-normal"> / 年</span></p>
              </div>
              
              {/* Mini Bar Chart */}
              <div className="w-full h-12 flex items-end gap-1.5 mt-6">
                <div className="w-1/4 bg-blue-50 rounded-t-sm h-1/3"></div>
                <div className="w-1/4 bg-blue-100 rounded-t-sm h-1/2"></div>
                <div className="w-1/4 bg-blue-300 rounded-t-sm h-3/4"></div>
                <div className="w-1/4 bg-blue-600 rounded-t-sm h-full"></div>
              </div>
            </div>
            
            {/* Acceptance Rate Bento */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform cursor-pointer">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">录取难度</p>
                <p className="text-xl font-bold text-slate-800 mt-1">极高</p>
              </div>
              {/* Circular Progress */}
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-rose-500" strokeWidth="4" strokeDasharray="4, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-slate-700">4%</span>
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Programs Bento (Spans full width) */}
          <div className="md:col-span-3 bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🎓
              </div>
              <div>
                <h2 className="font-bold text-xl mb-1">浏览留学项目库</h2>
                <div className="flex gap-3 text-sm text-slate-400 font-medium">
                  <span className="bg-white/10 px-2 py-0.5 rounded">本科 60+</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded">硕士 80+</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded">博士 40+</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold text-lg group-hover:translate-x-2 transition-transform">
              →
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
