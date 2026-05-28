import React from 'react';

// 定义扩展后的申请看板生命周期各阶段列，增加“补充材料中”、“已获录取 (Offer)”和“已拒绝”
const STATUS_COLUMNS = [
  { id: 'planning', title: '规划中' },
  { id: 'preparing', title: '准备材料中' },
  { id: 'supplement', title: '补充材料中' },
  { id: 'submitted', title: '已提交' },
  { id: 'waiting', title: '面试/等待' },
  { id: 'offer', title: '已获录取 (Offer)' },
  { id: 'rejected', title: '已拒绝' }
];

/**
 * 申请进度看板组件 (Kanban View)
 * 将留学申请按进度状态进行分类展示，支持直接在卡片上修改状态和截止日期。
 * 支持根据 filter 属性过滤展示的状态列（'all' | 'active' | 'offer'）。
 */
export function ApplicationKanban({ apps, filter = 'all', handleStatusChange, handleDeadlineChange, handleDelete, isUrgent }) {
  // 根据阶段筛选状态（全部、进行中、录取结果）过滤渲染的看板阶段列
  const filteredColumns = STATUS_COLUMNS.filter(col => {
    if (filter === 'active') {
      return ['planning', 'preparing', 'supplement', 'submitted', 'waiting'].includes(col.id);
    }
    if (filter === 'offer') {
      return ['offer', 'rejected'].includes(col.id);
    }
    return true; // 默认 'all'
  });

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-full">
      {filteredColumns.map(col => (
        <div key={col.id} className="flex flex-col min-w-[300px] w-[300px] bg-slate-100 rounded-2xl p-4 border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-4 flex justify-between items-center">
            {col.title}
            <span className="bg-white text-slate-500 px-2 py-0.5 rounded-full text-xs shadow-sm">
              {apps.filter(a => a.status === col.id).length}
            </span>
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto pr-2">
            {apps.filter(a => a.status === col.id).map(app => {
              const urgent = isUrgent(app);
              return (
              <div key={app.id} className={`bg-white p-4 rounded-xl shadow-sm border ${urgent ? 'border-red-400 shadow-red-100/50' : 'border-slate-200'} hover:shadow-md transition-shadow group relative`}>
                <button onClick={() => handleDelete(app.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="删除记录">✕</button>
                <h4 className="font-bold text-slate-800 text-lg mb-1 leading-tight pr-6 flex items-center gap-2">
                  {app.programs?.title || app.program_name} {urgent && <span title="即将截止" className="text-red-500 text-sm">⚠️</span>}
                </h4>
                
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">截止日期</span>
                    <input 
                      type="date" 
                      value={app.deadline || ''} 
                      onChange={(e) => handleDeadlineChange(app.id, e.target.value)}
                      className={`text-xs ${urgent ? 'text-red-600 font-bold' : 'text-slate-600'} bg-transparent border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500`}
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
            )})}
            {apps.filter(a => a.status === col.id).length === 0 && (
              <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                暂无项目
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
