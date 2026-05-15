import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { universityService } from '../services/universityService';
import { locationService } from '../services/locationService';

export function CountryPage() {
  const navigate = useNavigate();
  const { countryId } = useParams();
  const [universities, setUniversities] = useState([]);
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const countryData = await locationService.getCountryById(countryId);
        if (countryData) setCountry(countryData);
        
        const uniData = await universityService.getUniversitiesByCountry(countryId);
        if (uniData) setUniversities(uniData);
      } catch (err) {
        console.error("Failed to load country data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (countryId) fetchData();
  }, [countryId]);

  return (
    <div className="app-container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="button-glow" onClick={() => navigate(-1)} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', padding: '0.5rem 1rem' }}>
            ← 返回
          </button>
          <h1 style={{ margin: 0 }}>{country ? country.name : '探索大学'}</h1>
        </div>
      </header>

      <main className="main-layout bg-transparent border-none shadow-none mt-4 h-full overflow-y-auto w-full block">
        {loading ? (
          <div className="w-full flex justify-center py-20 text-slate-400">正在加载大学列表...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-10">
            {universities.map(uni => (
              <div 
                key={uni.id} 
                onClick={() => navigate(`/university/${uni.id}`)}
                className="glass-panel cursor-pointer hover:shadow-xl transition-all hover:border-indigo-300"
                style={{ padding: '1.25rem' }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl flex-shrink-0">
                    {uni.name ? uni.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white m-0 leading-tight">{uni.name}</h3>
                    <p className="text-sm text-slate-400 m-0 mt-1">{uni.city || '未知城市'}</p>
                  </div>
                </div>
              </div>
            ))}
            {universities.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-500">该国家下暂无大学数据</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
