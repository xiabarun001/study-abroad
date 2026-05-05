import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../shared/db/supabase';

export function CountryPage() {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  const countryNameMap = {
    usa: '美国 🇺🇸',
    canada: '加拿大 🇨🇦'
  };

  const displayName = countryNameMap[countryId] || countryId;
  const dbLocationMatch = countryId === 'usa' ? '美国' : countryId === 'canada' ? '加拿大' : '';

  useEffect(() => {
    async function fetchUniversities() {
      try {
        let query = supabase.from('universities').select('*').order('qs_ranking', { ascending: true });
        if (dbLocationMatch) {
          query = query.ilike('location', `%${dbLocationMatch}%`);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        setUniversities(data || []);
      } catch (err) {
        console.error('Error fetching universities:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUniversities();
    
    // Setup Realtime Subscription
    const subscription = supabase
      .channel('public:universities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'universities' }, fetchUniversities)
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [countryId, dbLocationMatch]);

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

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-20 text-slate-500">加载数据中...</div>
          ) : universities.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
               <p className="text-slate-500 mb-2">暂无该国家的院校数据</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {universities.map(uni => (
                <div 
                  key={uni.id} 
                  onClick={() => navigate(`/university/${uni.id}`)}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer relative"
                >
                  {uni.qs_ranking && (
                    <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                      QS #{uni.qs_ranking}
                    </div>
                  )}
                  <div className="w-12 h-12 bg-blue-50 rounded-full mb-4 flex items-center justify-center text-blue-600 font-bold border border-blue-100 overflow-hidden">
                    {uni.name_zh ? uni.name_zh.substring(0, 1) : 'U'}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-1 truncate" title={uni.name_zh}>{uni.name_zh}</h3>
                  <p className="text-sm text-slate-500 font-medium truncate" title={uni.location}>{uni.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
