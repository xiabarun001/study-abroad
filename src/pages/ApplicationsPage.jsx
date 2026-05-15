import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { applicationService } from '../services/applicationService';

const STATUS_COLUMNS = [
  { id: 'planning', title: '规划中' },
  { id: 'preparing', title: '准备材料' },
  { id: 'submitted', title: '已提交' },
  { id: 'waiting', title: '面试/等待' },
  { id: 'result', title: '结果' }
];

export function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Calculate urgent items (deadline within 14 days and not in result)
  const urgentApps = apps.filter(a => {
    if (a.status === 'result' || !a.deadline) return false;
    const diff = (new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 14;
  }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  return (
    <div className="flex flex-col w-full h-full p-8 overflow-y-auto bg-slate-50">
      <h2 className="text-3xl font-bold mb-6 font-outfit text-slate-800">我的申请</h2>
      
      {urgentApps.length > 0 && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-red-600 font-bold mb-3 flex items-center gap-2">
            <span>🚨</span> 紧迫任务提醒
          </h3>
          <div className="flex flex-col gap-2">
            {urgentApps.map(a => (
              <div key={a.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-red-100">
                <span className="font-semibold text-slate-800">{a.programs?.title}</span>
                <span className="text-red-500 font-bold text-sm">距离截止: {Math.ceil((new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24))} 天</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        {STATUS_COLUMNS.map(col => (
          <div key={col.id} className="flex flex-col min-w-[300px] w-[300px] bg-slate-100 rounded-2xl p-4 border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 flex justify-between items-center">
              {col.title}
              <span className="bg-white text-slate-500 px-2 py-0.5 rounded-full text-xs shadow-sm">
                {apps.filter(a => a.status === col.id).length}
              </span>
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto pr-2">
              {apps.filter(a => a.status === col.id).map(app => (
                <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative">
                  <button onClick={() => handleDelete(app.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="删除记录">✕</button>
                  <h4 className="font-bold text-slate-800 text-lg mb-1 leading-tight pr-6">{app.programs?.title}</h4>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">截止日期</span>
                      <input 
                        type="date" 
                        value={app.deadline || ''} 
                        onChange={(e) => handleDeadlineChange(app.id, e.target.value)}
                        className="text-xs text-slate-600 bg-transparent border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">当前阶段</span>
                      <select 
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="text-xs font-semibold bg-indigo-50 text-indigo-700 rounded px-2 py-1 outline-none cursor-pointer border-none"
                      >
                        {STATUS_COLUMNS.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {apps.filter(a => a.status === col.id).length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                  暂无项目
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
