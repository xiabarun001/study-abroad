import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationService } from '../services/locationService';
import { programService } from '../services/programService';
import { FavoriteButton } from '../components/FavoriteButton';

export function MapPage() {
  const navigate = useNavigate();
  const [continents, setContinents] = useState([]);
  const [trendingPrograms, setTrendingPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programsLoading, setProgramsLoading] = useState(true);

  useEffect(() => {
    const fetchContinents = async () => {
      try {
        const data = await locationService.getContinents();
        // Fallback mock data if DB is empty
        if (data && data.length > 0) {
          setContinents(data);
        } else {
          setContinents([
            { id: '1', name: '北美洲', cover_image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80' },
            { id: '2', name: '欧洲', cover_image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80' },
            { id: '3', name: '亚洲', cover_image: 'https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?auto=format&fit=crop&w=600&q=80' },
            { id: '4', name: '大洋洲', cover_image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=600&q=80' }
          ]);
        }
      } catch (err) {
        console.error("Failed to load continents:", err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchTrendingPrograms = async () => {
      try {
        const data = await programService.getTrendingPrograms(6);
        if (data && data.length > 0) {
          setTrendingPrograms(data);
        } else {
          setTrendingPrograms([
            { id: 'p1', title: '计算机科学理学硕士 (MSCS)', description: '斯坦福大学计算机科学系提供的人工智能方向顶级硕士项目，注重理论与工程实践的结合。', universities: { id: 'u1', name_zh: '斯坦福大学', countries: { name_zh: '美国' } } },
            { id: 'p2', title: '商业分析硕士 (MBAn)', description: 'MIT 斯隆商学院提供的硬核商业分析项目，结合数据科学与管理学。', universities: { id: 'u2', name_zh: '麻省理工学院', countries: { name_zh: '美国' } } },
            { id: 'p3', title: '金融学硕士 (MSc Finance)', description: 'LSE 的王牌金融项目，培养具备全球视野的投资与公司金融精英。', universities: { id: 'u3', name_zh: '伦敦政治经济学院', countries: { name_zh: '英国' } } }
          ]);
        }
      } catch (err) {
        console.error("Failed to load trending programs:", err);
      } finally {
        setProgramsLoading(false);
      }
    };

    fetchContinents();
    fetchTrendingPrograms();
  }, []);

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto bg-slate-50 relative">
      {/* Dynamic Hero Section */}
      <div className="w-full bg-slate-900 text-white relative flex-shrink-0">
        <div className="absolute inset-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=80" alt="Campus" className="w-full h-full object-cover opacity-20 object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
        </div>
        
        <div className="relative z-10 px-8 py-20 md:py-28 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
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
            <div className="flex gap-4 pt-4">
              <button onClick={() => navigate('/advisor')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2">
                <span>✨</span> 唤醒 AI 顾问
              </button>
              <button onClick={() => window.scrollTo({top: 500, behavior: 'smooth'})} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-sm transition-all border border-white/10">
                探索名校
              </button>
            </div>
          </div>
          <div className="hidden md:block w-72 h-72 lg:w-96 lg:h-96 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            {/* Visual placeholder for a 3D globe or illustration */}
            <div className="w-full h-full border border-white/10 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-md shadow-2xl relative z-10">
              <span className="text-8xl">🌍</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-16 w-full space-y-20">
        {/* Continents Grid */}
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-3xl font-bold font-outfit text-slate-800 tracking-tight">探索大洲</h2>
            <span className="text-slate-400 text-sm font-medium">浏览各地区顶级学府</span>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {continents.map(continent => (
                <div 
                  key={continent.id} 
                  onClick={() => navigate(`/continent/${continent.id}`)}
                  className="relative h-64 rounded-3xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-2xl transition-all duration-500"
                >
                  <img src={continent.cover_image || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80'} alt={continent.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-white text-2xl font-bold font-outfit mb-1">{continent.name}</h3>
                    <p className="text-indigo-200 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity delay-100">查看详情 &rarr;</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trending Programs Grid */}
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-3xl font-bold font-outfit text-slate-800 tracking-tight flex items-center gap-3">
              <span className="text-2xl">🔥</span> 热门推荐项目
            </h2>
            <span className="text-slate-400 text-sm font-medium">基于系统大数据的智能推荐</span>
          </div>
          {programsLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingPrograms.map(program => (
                <div key={program.id} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-slate-200/60 relative group transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                  <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FavoriteButton programId={program.id} />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      {program.universities?.countries?.name_zh || '全球'}
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 truncate">
                      {program.universities?.name_zh || '顶尖名校'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-3 leading-snug group-hover:text-indigo-600 transition-colors pr-8">
                    {program.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-8 flex-1">
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
          )}
        </section>
      </div>
    </div>
  );
}
