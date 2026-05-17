import React, { useState, useEffect } from 'react';
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
  const [apps, setApps] = useState([]); // 当前用户的申请记录列表
  const [loading, setLoading] = useState(true); // 数据加载状态
  const [activeView, setActiveView] = useState('kanban'); // 当前激活的视图类型 ('kanban' | 'calendar')

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

  return (
    <div className="flex flex-col w-full h-full p-8 overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold font-outfit text-slate-800">我的申请</h2>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveView('kanban')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeView === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            📋 看板
          </button>
          <button 
            onClick={() => setActiveView('calendar')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeView === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            📅 日历
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {activeView === 'kanban' ? (
          <ApplicationKanban 
            apps={apps} 
            handleStatusChange={handleStatusChange} 
            handleDeadlineChange={handleDeadlineChange} 
            handleDelete={handleDelete}
            isUrgent={isUrgent}
          />
        ) : (
          <ApplicationCalendar apps={apps} isUrgent={isUrgent} />
        )}
      </div>
    </div>
  );
}
