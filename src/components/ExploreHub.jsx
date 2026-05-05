import React from 'react';

export function ExploreHub() {
  return (
    <div className="w-full h-full bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">院校大厅</h2>
        
        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <select className="px-4 py-2 border border-slate-200 rounded-lg bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50">
            <option>所有大洲</option>
            <option>北美洲</option>
            <option>欧洲</option>
            <option>亚洲</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 rounded-lg bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50">
            <option>所有国家</option>
          </select>
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-blue-50 rounded-full mb-4 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                U{i}
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-1">大学名称 {i}</h3>
              <p className="text-sm text-slate-500 font-medium">国家 / 城市</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
