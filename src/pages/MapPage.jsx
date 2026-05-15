import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationService } from '../services/locationService';

export function MapPage() {
  const navigate = useNavigate();
  const [continents, setContinents] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchContinents();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </div>
  );
}
