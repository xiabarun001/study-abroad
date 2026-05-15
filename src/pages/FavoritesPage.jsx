import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { favoriteService } from '../services/favoriteService';
import { FavoriteButton } from '../components/FavoriteButton';
import { applicationService } from '../services/applicationService';

export function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleStartApplication = async (programId) => {
    try {
      await applicationService.createApplication(user.id, programId);
      navigate('/applications');
    } catch (err) {
      if (err.code === '23505') {
        alert('您已经将该项目加入到了申请列表中！');
        navigate('/applications');
      } else {
        console.error('Failed to start application:', err);
      }
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      try {
        const data = await favoriteService.getFavorites(user.id);
        if (data) setFavorites(data);
      } catch (err) {
        console.error("Failed to load favorites:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user]);

  if (authLoading || loading) return <div className="p-10 text-center text-slate-500">加载中...</div>;
  if (!user) return null;

  return (
    <div className="flex flex-col w-full h-full p-8 overflow-y-auto bg-slate-50">
      <h2 className="text-3xl font-bold mb-8 font-outfit text-slate-800 flex items-center gap-3">
        <span>❤️</span> 我的收藏
      </h2>
      
      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-lg mb-4">您还没有收藏任何项目</p>
          <button onClick={() => navigate('/')} className="button-glow px-6 py-2" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white', borderRadius: '8px' }}>
            去探索大学
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(fav => {
            const program = fav.programs;
            if (!program) return null;
            return (
              <div key={fav.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 relative group hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="absolute top-4 right-4 z-10">
                  <FavoriteButton programId={program.id} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 pr-10 mb-2 leading-tight">{program.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-4">{program.description || '暂无详细介绍'}</p>
                <div className="mt-auto flex justify-between items-center">
                  <button onClick={() => handleStartApplication(program.id)} className="text-sm bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-lg hover:bg-indigo-100 font-semibold transition-colors">
                    ✨ 启动申请
                  </button>
                  {program.url && (
                    <a href={program.url} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold text-sm hover:underline">
                      查看详情 →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
