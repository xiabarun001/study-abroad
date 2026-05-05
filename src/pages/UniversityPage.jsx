import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../shared/db/supabase';

export function UniversityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If id is not a valid UUID format, we might have an issue fetching, but let supabase handle the error
    async function fetchUniversityData() {
      try {
        const { data, error } = await supabase
          .from('universities')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            throw error;
          }
        }
        setUniversity(data || null);
      } catch (err) {
        console.error('Error fetching university:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUniversityData();

    // Setup Realtime Subscription
    const subscription = supabase
      .channel(`public:universities:id=eq.${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'universities', filter: `id=eq.${id}` },
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchUniversityData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">数据加载中...</p>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-slate-500 font-medium mb-4">未找到该院校数据 (ID: {id})</p>
        <button 
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          返回上一页
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Bento */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-between border border-slate-100">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              ←
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md overflow-hidden">
                {university.name_zh ? university.name_zh.substring(0, 1) : 'U'}
              </div>
              <div>
                <h1 className="font-black text-2xl tracking-tight text-slate-800">{university.name_zh}</h1>
                <p className="text-sm text-slate-500 font-medium">
                  {university.name_en} {university.location ? `• ${university.location}` : ''}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {university.qs_ranking && (
               <div className="bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm border border-yellow-200">
                 QS排名 #{university.qs_ranking}
               </div>
             )}
             <button className="bg-slate-800 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-slate-700 transition-colors">
               ⭐ 收藏
             </button>
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Hero Media Bento (Spans 2 columns) */}
          <div 
            className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl relative overflow-hidden shadow-sm min-h-[320px] group cursor-pointer"
            style={university.hero_image_url ? { backgroundImage: `url(${university.hero_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
            
            <div className="absolute bottom-6 left-6 text-white">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3">
                ▶
              </div>
              <h2 className="font-bold text-2xl tracking-tight">探索校园风采</h2>
              <p className="text-sm text-slate-300 mt-1">观看官方宣传片</p>
            </div>
          </div>
          
          {/* Right Column Stats */}
          <div className="flex flex-col gap-6">
            
            {/* Tuition Bento */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:-translate-y-1 transition-transform cursor-pointer">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">平均本科学费</p>
                <p className="text-3xl font-black text-slate-800 mt-2">
                  {university.undergrad_tuition ? `$${university.undergrad_tuition.toLocaleString()}` : '暂无数据'}
                  {university.undergrad_tuition && <span className="text-sm text-slate-400 font-medium tracking-normal"> / 年</span>}
                </p>
              </div>
              
              {/* Mini Bar Chart */}
              <div className="w-full h-12 flex items-end gap-1.5 mt-6">
                <div className="w-1/4 bg-blue-50 rounded-t-sm h-1/3"></div>
                <div className="w-1/4 bg-blue-100 rounded-t-sm h-1/2"></div>
                <div className="w-1/4 bg-blue-300 rounded-t-sm h-3/4"></div>
                <div className="w-1/4 bg-blue-600 rounded-t-sm h-full"></div>
              </div>
            </div>
            
            {/* Acceptance Rate Bento */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform cursor-pointer">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">录取难度</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  {university.acceptance_rate ? (university.acceptance_rate < 10 ? '极高' : university.acceptance_rate < 30 ? '较高' : '适中') : '未知'}
                </p>
              </div>
              {/* Circular Progress */}
              {university.acceptance_rate && (
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-rose-500" strokeWidth="4" strokeDasharray={`${university.acceptance_rate}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-black text-slate-700">{university.acceptance_rate}%</span>
                  </div>
                </div>
              )}
            </div>
            
          </div>
          
          {/* Programs Bento (Spans full width) */}
          <div className="md:col-span-3 bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🎓
              </div>
              <div>
                <h2 className="font-bold text-xl mb-1">浏览留学项目库</h2>
                <div className="flex gap-3 text-sm text-slate-400 font-medium">
                  <span className="bg-white/10 px-2 py-0.5 rounded">点击查看该校所有可选专业</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold text-lg group-hover:translate-x-2 transition-transform">
              →
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
