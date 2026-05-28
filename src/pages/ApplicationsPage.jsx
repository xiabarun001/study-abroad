import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // 引入 URL 查询参数管理 Hook
import { useAuth } from '../hooks/useAuth';
import { applicationService } from '../services/applicationService';
import { ApplicationKanban } from '../components/ApplicationKanban';
import { ApplicationCalendar } from '../components/ApplicationCalendar';

/**
 * 我的申请追踪页面组件 (Applications Page)
 * 供用户管理所有的留学申请进度。
 * 支持双视图切换：看板视图 (Kanban) 和 日历视图 (Calendar)。
 */
export function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams(); // 用于获取/更新 URL 上的筛选过滤状态
  const [apps, setApps] = useState([]); // 当前用户的申请记录列表
  const [loading, setLoading] = useState(true); // 数据加载状态
  const [activeView, setActiveView] = useState('kanban'); // 当前激活的视图类型 ('kanban' | 'calendar')

  // 从 URL 上的 filter 参数中初始化筛选状态，默认为 'all' (显示全部)
  const filter = searchParams.get('filter') || 'all';

  // 切换阶段筛选状态并同步至 URL 查询参数
  const handleFilterChange = (newFilter) => {
    setSearchParams({ filter: newFilter });
  };

  const fetchApps = async () => {
    if (!user) return;
    try {
      const data = await applicationService.getApplications(user.id);
      if (data) setApps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [user]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setApps(apps.map(a => a.id === id ? { ...a, status: newStatus } : a));
      await applicationService.updateStatus(id, newStatus);
    } catch (err) {
      console.error(err);
      fetchApps(); // revert on failure
    }
  };

  const handleDeadlineChange = async (id, newDeadline) => {
    try {
      setApps(apps.map(a => a.id === id ? { ...a, deadline: newDeadline } : a));
      await applicationService.updateDeadline(id, newDeadline);
    } catch (err) {
      console.error(err);
      fetchApps();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("确定要删除这条申请记录吗？")) return;
    try {
      setApps(apps.filter(a => a.id !== id));
      await applicationService.deleteApplication(id);
    } catch (err) {
      console.error(err);
      fetchApps();
    }
  };

  if (authLoading || loading) return <div className="p-10 text-center text-slate-500">加载中...</div>;
  if (!user) return <div className="p-10 text-center text-slate-500">请先登录</div>;

  // Calculate urgent items (deadline within 7 days and not in result/submitted)
  const isUrgent = (app) => {
    if (app.status === 'result' || app.status === 'submitted' || !app.deadline) return false;
    const diff = (new Date(app.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  };

  // 根据 URL 上 filter 状态，过滤日历视图中显示的项目，使阶段和日历联动
  const filteredAppsForCalendar = apps.filter(app => {
    if (filter === 'active') {
      return ['planning', 'preparing', 'supplement', 'submitted', 'waiting'].includes(app.status);
    }
    if (filter === 'offer') {
      return ['offer', 'rejected'].includes(app.status);
    }
    return true; // 'all'
  });

  return (
    <div className="flex flex-col w-full h-full p-8 overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold font-outfit text-slate-800">我的申请</h2>
        
        <div className="flex items-center gap-4">
          {/* 阶段过滤 Tab：全部、进行中、录取/结果 */}
          <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-xl shadow-inner">
            <button 
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              全部阶段
            </button>
            <button 
              onClick={() => handleFilterChange('active')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filter === 'active' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              进行中
            </button>
            <button 
              onClick={() => handleFilterChange('offer')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filter === 'offer' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              录取/结果
            </button>
          </div>

          {/* 视图切换 Tab：看板与日历，使用精致微投影与圆角风格 */}
          <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-xl shadow-inner">
            <button 
              onClick={() => setActiveView('kanban')}
              className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${activeView === 'kanban' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              📋 看板
            </button>
            <button 
              onClick={() => setActiveView('calendar')}
              className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${activeView === 'calendar' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              📅 日历
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {activeView === 'kanban' ? (
          <ApplicationKanban 
            apps={apps} 
            filter={filter} /* 传入过滤条件以供看板动态筛选状态列 */
            handleStatusChange={handleStatusChange} 
            handleDeadlineChange={handleDeadlineChange} 
            handleDelete={handleDelete}
            isUrgent={isUrgent}
          />
        ) : (
          <ApplicationCalendar apps={filteredAppsForCalendar} isUrgent={isUrgent} />
        )}
      </div>
    </div>
  );
}
