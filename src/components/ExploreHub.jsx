import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../shared/db/supabase';

export function ExploreHub() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUniversities() {
      try {
        const { data, error } = await supabase.from('universities').select('*').order('qs_ranking', { ascending: true });
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
  }, []);

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
        
        {loading ? (
          <div className="text-center py-20 text-slate-500">加载数据中...</div>
        ) : universities.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
             <p className="text-slate-500 mb-2">暂无院校数据，请使用爬虫工具抓取或在数据库中添加</p>
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
                <p className="text-sm text-slate-500 font-medium truncate" title={uni.location}>{uni.location || '未知位置'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
