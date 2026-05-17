import React from 'react';

export function DiscoverPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50 w-full overflow-y-auto">
      {/* Header Section */}
      <div className="w-full bg-white border-b border-slate-200 px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">发现项目</h1>
          <p className="text-slate-500">探索全球顶尖名校的优质留学项目</p>
        </div>
      </div>

      {/* Main Content (Grid layout for Sidebar and List) */}
      <div className="max-w-7xl mx-auto w-full px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4">高级筛选</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">目标国家</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-indigo-600" /> 美国</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-indigo-600" /> 英国</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-indigo-600" /> 新加坡</label>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">学位等级</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-indigo-600" /> 本科 (Bachelor)</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-indigo-600" /> 硕士 (Master)</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-indigo-600" /> 博士 (PhD)</label>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-8 bg-indigo-50 text-indigo-700 font-bold py-2 rounded-lg hover:bg-indigo-100 transition-colors">
              应用筛选
            </button>
          </div>
        </div>

        {/* Project List (Placeholder) */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <span className="text-4xl mb-4">🔍</span>
            <h3 className="text-xl font-bold text-slate-800 mb-2">项目数据接入中...</h3>
            <p className="text-slate-500 max-w-md">我们在后台正在为您加载最新的全球名校项目数据，此处将呈现支持无限滚动加载的瀑布流列表。</p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
