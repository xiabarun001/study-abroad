import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { locationService } from '../services/locationService';

/**
 * 大洲专属展示页面组件 (Continent Page)
 * 根据 URL 路径中的 continentId 加载该大洲下属的所有国家列表并展示卡片
 */
export function ContinentPage() {
  const navigate = useNavigate();
  const { continentId } = useParams(); // 从路由参数中提取大洲 ID
  const [countries, setCountries] = useState([]); // 国家列表状态
  const [loading, setLoading] = useState(true); // 加载状态

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await locationService.getCountriesByContinent(continentId);
        if (data) setCountries(data);
      } catch (err) {
        console.error("Failed to load countries:", err);
      } finally {
        setLoading(false);
      }
    };
    if (continentId) fetchCountries();
  }, [continentId]);

  return (
    <div className="app-container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="button-glow" onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', padding: '0.5rem 1rem' }}>
            ← 返回首页
          </button>
          <h1 style={{ margin: 0 }}>探索国家</h1>
        </div>
      </header>

      <main className="main-layout bg-transparent border-none shadow-none mt-4">
        {loading ? (
          <div className="w-full flex justify-center py-20 text-slate-400">正在加载国家列表...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full h-fit">
            {countries.map(country => (
              <div 
                key={country.id} 
                onClick={() => navigate(`/country/${country.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="h-40 overflow-hidden">
                  <img src={country.cover_image || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80'} alt={country.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-slate-800 font-outfit">{country.name}</h3>
                </div>
              </div>
            ))}
            {countries.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-500">该大洲下暂无国家数据</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
