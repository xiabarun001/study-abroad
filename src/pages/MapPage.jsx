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
        if (data) setContinents(data);
      } catch (err) {
        console.error("Failed to load continents:", err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchTrendingPrograms = async () => {
      try {
        const data = await programService.getTrendingPrograms(6);
        if (data) setTrendingPrograms(data);
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
    <div className="flex flex-col w-full h-full p-8 overflow-y-auto bg-slate-50">
      {/* Promo Banner */}
      <div className="w-full h-64 bg-indigo-600 rounded-3xl mb-12 flex items-center justify-center text-white shadow-lg overflow-hidden relative">
        <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1600" className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Study Abroad" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold mb-4 font-outfit">开启您的留学之旅</h1>
          <p className="text-xl opacity-90 font-inter">探索全球顶尖学府，成就无限可能</p>
        </div>
      </div>

      {/* Continents Grid */}
      <h2 className="text-2xl font-bold mb-6 font-outfit text-slate-800">选择大洲</h2>
      {loading ? (
        <div className="text-center py-10 text-slate-500">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {continents.map(continent => (
            <div 
              key={continent.id} 
              onClick={() => navigate(`/continent/${continent.id}`)}
              className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img src={continent.cover_image || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80'} alt={continent.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-white text-2xl font-bold font-outfit">{continent.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trending Programs Grid */}
      <h2 className="text-2xl font-bold mb-6 font-outfit text-slate-800 flex items-center gap-2">
        <span>🔥</span> 热门推荐项目
      </h2>
      {programsLoading ? (
        <div className="text-center py-10 text-slate-500">拉取热门项目中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingPrograms.map(program => (
            <div key={program.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 relative group hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="absolute top-4 right-4 z-10">
                <FavoriteButton programId={program.id} />
              </div>
              <div className="text-xs font-bold text-indigo-500 bg-indigo-50 inline-block px-2 py-1 rounded mb-3">
                {program.universities?.countries?.name_zh} • {program.universities?.name_zh}
              </div>
              <h3 className="text-xl font-bold text-slate-800 pr-10 mb-2 leading-tight">{program.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-3 mb-4">{program.description || '暂无详细介绍'}</p>
              <div className="mt-auto flex justify-between items-center">
                <button 
                  onClick={() => navigate(`/university/${program.universities?.id}`)} 
                  className="text-sm bg-slate-50 text-slate-600 px-4 py-1.5 rounded-lg hover:bg-slate-100 font-semibold transition-colors"
                >
                  查看大学
                </button>
                {program.url && (
                  <a href={program.url} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold text-sm hover:underline">
                    项目官网 →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
