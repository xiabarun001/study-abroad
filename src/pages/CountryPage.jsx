import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function CountryPage() {
  const { countryId } = useParams();
  const navigate = useNavigate();

  const countryNameMap = {
    usa: '美国 🇺🇸',
    canada: '加拿大 🇨🇦'
  };

  const displayName = countryNameMap[countryId] || countryId;

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors"
          >
            ← 返回地图
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <h1 className="text-xl font-bold text-slate-800">{displayName} - 院校列表</h1>
        </div>
      </header>

      {/* Main Content (similar to ExploreHub) */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div 
                key={i} 
                onClick={() => navigate(`/university/${countryId}-${i}`)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-full mb-4 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                  U{i}
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">大学名称 {i}</h3>
                <p className="text-sm text-slate-500 font-medium">{displayName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
