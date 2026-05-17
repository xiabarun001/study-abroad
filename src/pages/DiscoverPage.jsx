import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { programService } from '../services/programService';
import { FavoriteButton } from '../components/FavoriteButton';

// 可供筛选的热门留学目标国家列表
const ALL_COUNTRIES = ['美国', '英国', '新加坡', '澳大利亚', '加拿大', '中国香港', '日本', '韩国', '德国', '法国', '瑞士', '荷兰', '新西兰', '欧洲其他'];

/**
 * 留学项目大全页面组件 (Discover Page)
 * 负责展示、搜索、过滤全球留学项目。
 * 实现了本地兜底数据与 Electron 端 AI 实时搜索的双轨机制。
 */
export function DiscoverPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(''); // 搜索关键词
  const [selectedCountries, setSelectedCountries] = useState([]); // 被选中的国家筛选项
  const [programs, setPrograms] = useState([]); // 当前显示的项目列表
  const [isLoading, setIsLoading] = useState(true); // 是否正在加载数据
  const [isAutoUpdating, setIsAutoUpdating] = useState(false); // 是否在后台静默刷新数据

  const handleCountryToggle = (country) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const handleSearch = async (isAuto = false) => {
    if (isAuto) {
      setIsAutoUpdating(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const data = await programService.searchProgramsRealTime({ 
        keyword, 
        countries: selectedCountries 
      });
      setPrograms(data || []);
    } catch (error) {
      console.error('Failed to fetch real-time programs:', error);
      if (!isAuto) setPrograms([]);
    } finally {
      setIsLoading(false);
      setIsAutoUpdating(false);
    }
  };

  // Initial load & Auto-update setup
  useEffect(() => {
    handleSearch();
    
    // 1-hour auto-update interval (3600000 ms)
    const intervalId = setInterval(() => {
      handleSearch(true);
    }, 3600000);
    
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, selectedCountries]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 w-full overflow-y-auto silent-scroll">
      {/* Header Section */}
      <div className="w-full bg-white border-b border-slate-200 px-8 py-6">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-slate-800">项目大全</h1>
        </div>
      </div>

      {/* Main Content (Grid layout for Sidebar and List) */}
      <div className="w-full px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4">高级筛选</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">目标国家</label>
                <div className="space-y-2">
                  {ALL_COUNTRIES.map(country => (
                    <label key={country} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-indigo-600 transition-colors">
                      <input 
                        type="checkbox" 
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={selectedCountries.includes(country)}
                        onChange={() => handleCountryToggle(country)}
                      /> 
                      {country}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">学位等级</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-indigo-600 cursor-pointer" /> 本科 (Bachelor)</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-indigo-600 cursor-pointer" /> 硕士 (Master)</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-indigo-600 cursor-pointer" /> 博士 (PhD)</label>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleSearch}
              className="w-full mt-8 bg-indigo-50 text-indigo-700 font-bold py-2 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              应用筛选
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 flex flex-col">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm mb-6 flex items-center">
            <span className="pl-4 pr-2 text-slate-400 text-xl">🔍</span>
            <input 
              type="text" 
              placeholder="搜索项目名称、描述或关键字..." 
              className="flex-1 border-none focus:ring-0 text-slate-700 placeholder-slate-400 py-2 outline-none"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold transition-colors ml-2 shadow-sm shadow-indigo-200"
            >
              搜索
            </button>
          </div>

          {/* Results Area */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
            </div>
          ) : programs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {programs.map(program => (
                <div key={program.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200/60 relative group transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                  <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FavoriteButton programId={program.id} />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      {program.universities?.countries?.name_zh || '全球'}
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 truncate max-w-[150px]">
                      {program.universities?.name_zh || '顶尖名校'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug group-hover:text-indigo-600 transition-colors pr-8">
                    {program.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                    {program.description || '该项目暂无详细介绍，点击查看大学页面了解更多院系详情及招生要求。'}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => navigate(`/university/${program.universities?.id || ''}`)} 
                      className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1"
                    >
                      查看大学 <span className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-5px] group-hover:translate-x-0">&rarr;</span>
                    </button>
                    {program.url && (
                      <a href={program.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors p-2 bg-slate-50 hover:bg-indigo-50 rounded-full">
                        🔗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
              <span className="text-4xl mb-4 text-slate-300">📭</span>
              <h3 className="text-xl font-bold text-slate-700 mb-2">未找到匹配的项目</h3>
              <p className="text-slate-500 max-w-md">请尝试更换搜索关键字，或调整左侧的筛选条件。</p>
              <button 
                onClick={() => {
                  setKeyword('');
                  setSelectedCountries([]);
                  setIsLoading(true);
                  programService.searchPrograms({ keyword: '', countries: [] })
                    .then(data => setPrograms(data || []))
                    .catch(() => setPrograms([]))
                    .finally(() => setIsLoading(false));
                }}
                className="mt-6 text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
              >
                重置筛选条件
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
