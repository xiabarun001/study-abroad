import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { applicationService } from '../services/applicationService';
import { favoriteService } from '../services/favoriteService';

// 各申请阶段所对应的精细化子任务清单 mapper，用于大盘任务管理
const STAGE_CHECKLISTS = {
  planning: [
    { key: 'plan-school', label: '确定目标国家及申请院校清单' },
    { key: 'plan-score', label: '制定GPA及语言/标化考试备考计划' },
    { key: 'plan-budget', label: '评估留学费用预算与资金准备' }
  ],
  preparing: [
    { key: 'prep-transcript', label: '开具中英文官方成绩单及在读证明' },
    { key: 'prep-sop', label: '撰写个人陈述 (Statement of Purpose)' },
    { key: 'prep-lor', label: '联系推荐老师并开具推荐信 (LoR)' },
    { key: 'prep-cv', label: '润色个人简历 (CV) 与作品集' }
  ],
  submitted: [
    { key: 'sub-online', label: '在学校网申系统中正式提交申请' },
    { key: 'sub-fee', label: '缴纳申请处理规费 (Application Fee)' },
    { key: 'sub-confirm', label: '确认推荐信已由推荐人提交成功' }
  ],
  waiting: [
    { key: 'wait-status', label: '定期查询网申状态，跟进反馈邮件' },
    { key: 'wait-interview', label: '准备并参加可能进行的面试环节' }
  ],
  supplement: [
    { key: 'supp-detail', label: '根据院系提示补充寄送相关证明材料' }
  ]
};

/**
 * 申请中心大盘门户组件 (Application Hub Page)
 * 聚合展示用户的申请进度、录取成果和收藏项目，提供临近截止提示与一键快捷启动申请。
 */
export function ApplicationHubPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 【新增代码】获取当前路由状态，用以处理常驻隐藏页面的唤醒刷新
  const [apps, setApps] = useState([]); // 用户的所有申请记录
  const [favorites, setFavorites] = useState([]); // 用户的所有收藏记录
  const [loading, setLoading] = useState(true); // 数据加载状态
  const [actionLoadingId, setActionLoadingId] = useState(null); // 防止快速重复点击的按钮加载状态
  
  const [expandedAppId, setExpandedAppId] = useState(null); // 新增：控制大盘垂直时间轴上折叠展开的申请记录ID
  const [checklistUpdates, setChecklistUpdates] = useState(0); // 新增：用于在子任务被勾选时触发本地状态重新刷新渲染

  // 1. 获取所有的申请与收藏数据
  const fetchData = async () => {
    if (!user) return;
    try {
      const [appsData, favsData] = await Promise.all([
        applicationService.getApplications(user.id),
        favoriteService.getFavorites(user.id)
      ]);
      if (appsData) setApps(appsData);
      if (favsData) setFavorites(favsData);
    } catch (err) {
      console.error("加载申请大盘数据失败:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. 路由守卫：检测未登录状态下且当前路由是申请中心（/hub）时，才自动跳转回首页
  useEffect(() => {
    if (!authLoading && !user && location.pathname === '/hub') {
      console.log('User not logged in, redirecting from /hub to /');
      navigate('/');
    }
  }, [user, authLoading, navigate, location.pathname]);

  // 3. 挂载与活动状态监听数据获取：当用户变更，或者页面由 hidden 后台唤醒切换为激活路径（/hub）时，静默拉取数据库最新状态同步
  useEffect(() => {
    if (user && location.pathname === '/hub') {
      fetchData();
    }
  }, [user, location.pathname]);

  // 4. 一键快速启动申请逻辑
  const handleStartApplication = async (programId) => {
    if (actionLoadingId) return;
    setActionLoadingId(programId);
    try {
      // 在后端创建申请记录，默认状态为 'planning'
      await applicationService.createApplication(user.id, programId);
      // 创建成功后，自动跳转至“我的申请”看板页
      navigate('/applications');
    } catch (err) {
      // 捕获唯一性约束（已存在）的异常
      if (err.code === '23505' || (err.message && err.message.includes('unique'))) {
        alert('您已经将该项目加入到了申请列表中！');
        navigate('/applications');
      } else {
        console.error('快速启动申请失败:', err);
        alert('启动申请时发生异常，请检查数据库约束。');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. 渲染加载中或未登录占位
  if (authLoading || loading) return <div className="p-10 text-center text-slate-500 font-medium">加载中...</div>;
  if (!user) return null;

  // 6. 进行核心统计计算
  // 进行中申请包括：规划中、准备材料中、补充材料中、已提交、等待面试
  const activeAppsCount = apps.filter(app => 
    ['planning', 'preparing', 'supplement', 'submitted', 'waiting'].includes(app.status)
  ).length;

  // 已获录取 Offer 数量 (包含老的 result 状态作为降级兼容)
  const offerCount = apps.filter(app => app.status === 'offer' || app.status === 'result').length;

  const today = new Date();
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 7. 取所有进行中的申请，按日期先后排序生成时间轴记录（若无截止日期则默认为兜底999天排在末尾）
  const timelineApps = apps.filter(app => {
    return ['planning', 'preparing', 'supplement', 'submitted', 'waiting'].includes(app.status);
  }).map(app => {
    let daysDiff = 999;
    if (app.deadline) {
      const deadlineDate = new Date(app.deadline);
      const timeDiff = deadlineDate.getTime() - today.getTime();
      daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    return { ...app, daysRemaining: daysDiff };
  }).sort((a, b) => a.daysRemaining - b.daysRemaining); // 按剩余截止天数由近到远排序

  // 8. 过滤最新收藏的 3 个项目
  const recentFavorites = favorites.slice(0, 3);

  // 9. 处理本地子任务勾选状态变更
  const handleToggleCheck = (appId, taskKey, e) => {
    e.stopPropagation(); // 阻止事件冒泡，防止触发卡片的折叠开关
    const storageKey = `app_checklist_${appId}`;
    const stored = localStorage.getItem(storageKey);
    let checkedKeys = stored ? JSON.parse(stored) : [];
    
    if (checkedKeys.includes(taskKey)) {
      checkedKeys = checkedKeys.filter(k => k !== taskKey);
    } else {
      checkedKeys = [...checkedKeys, taskKey];
    }
    
    localStorage.setItem(storageKey, JSON.stringify(checkedKeys));
    setChecklistUpdates(prev => prev + 1); // 触发页面数据重绘
  };

  return (
    <div className="flex-1 w-full p-8 overflow-y-auto bg-gradient-to-br from-slate-50 via-indigo-50/20 to-sky-50/30">
      
      {/* 📊 顶部：大盘数据统计卡片与 SVG 双环比例图组件 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* 卡片 1: 进行中的申请，点击跳转并带上进行中状态过滤条件 */}
        <div 
          onClick={() => navigate('/applications?filter=active')}
          className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          {/* 背景微发光装饰圈 */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl">📋</span>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold">进行中</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800 leading-none">{activeAppsCount}</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">进行中的项目 &rarr;</p>
        </div>

        {/* 卡片 2: 已拿下的 Offer，点击跳转并带上录取成果过滤条件 */}
        <div 
          onClick={() => navigate('/applications?filter=offer')}
          className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl">🎉</span>
            <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold">录取成果</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800 leading-none">{offerCount}</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">已斩获 Offer 喜报 &rarr;</p>
        </div>

        {/* 卡片 3: 我的收藏 */}
        <div 
          onClick={() => navigate('/favorites')}
          className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl">❤️</span>
            <span className="text-xs bg-rose-50 text-rose-600 px-3 py-1 rounded-full font-bold">项目收藏</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800 leading-none">{favorites.length}</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">心仪大学及项目 &rarr;</p>
        </div>

        {/* 卡片 4: 申请进度与录取占比双环图 (高保真纯 SVG 实现) */}
        {(() => {
          const totalApps = apps.length || 1;
          const offerRate = offerCount / totalApps;
          const activeRate = activeAppsCount / totalApps;
          
          return (
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between gap-4 group">
              <div className="flex-1 min-w-0">
                <span className="text-xs bg-violet-50 text-violet-600 px-3 py-1 rounded-full font-bold">进度看板</span>
                <h4 className="text-slate-700 font-bold text-sm mt-3.5 leading-tight">Offer 斩获率: {Math.round(offerRate * 100)}%</h4>
                <p className="text-slate-400 text-[11px] mt-1 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 已录取: {offerCount} 个
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 进行中: {activeAppsCount} 个
                </p>
              </div>
              
              {/* Apple Watch 运动圆环风格的双层活动进度条 SVG */}
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* 外环背景轨道 */}
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#F1F5F9" strokeWidth="5.5" />
                  {/* 内环背景轨道 */}
                  <circle cx="40" cy="40" r="22" fill="none" stroke="#F1F5F9" strokeWidth="5.5" />
                  
                  {/* 进行中项目环 (Indigo) */}
                  <circle 
                    cx="40" cy="40" r="32" 
                    fill="none" 
                    stroke="url(#indigoGrad)" 
                    strokeWidth="5.5" 
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - activeRate)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  
                  {/* 录取 Offer 环 (Emerald) */}
                  <circle 
                    cx="40" cy="40" r="22" 
                    fill="none" 
                    stroke="url(#emeraldGrad)" 
                    strokeWidth="5.5" 
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - offerRate)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  
                  <defs>
                    <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34D399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-[11px] font-black text-slate-700 select-none">📊</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 下方双栏结构 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 🗓️ 左栏：临近截止日期垂直时间轴 (5/12 宽度) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col min-h-[460px]">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 select-none">
            <span>📅</span> 申请进程时间轴
          </h3>
          
          {timelineApps.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <span className="text-4xl mb-3">🍃</span>
              <p className="text-slate-400 text-sm font-medium">暂无进行中的申请项目</p>
              <p className="text-slate-300 text-xs mt-1">在项目大全里找到心仪项目并启动申请吧！</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[480px] pr-1 relative pl-6 silent-scroll">
              {/* 垂直实线+虚线混合轨道轴 */}
              <div className="absolute left-[9px] top-2 bottom-2 w-[1.5px] bg-slate-200 border-l border-dashed border-slate-300"></div>
              
              <div className="flex flex-col gap-6">
                {timelineApps.map(app => {
                  const isExpanded = expandedAppId === app.id;
                  const isUrgent = app.daysRemaining !== 999 && app.daysRemaining <= 2;
                  
                  // 从 LocalStorage 读取当前项目的子任务清单完成度
                  const storageKey = `app_checklist_${app.id}`;
                  const stored = localStorage.getItem(storageKey);
                  const checkedTasks = stored ? JSON.parse(stored) : [];
                  const activeTasks = STAGE_CHECKLISTS[app.status] || [];
                  const totalTasks = activeTasks.length;
                  const completedTasks = activeTasks.filter(t => checkedTasks.includes(t.key)).length;
                  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                  return (
                    <div 
                      key={app.id} 
                      onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                      className="relative flex flex-col items-start group select-none transition-transform duration-200"
                    >
                      {/* 时间线状态指示灯（红色呼吸灯或靛蓝圆圈） */}
                      <div className="absolute left-[-21px] top-4.5 flex items-center justify-center">
                        {isUrgent ? (
                          <span className="relative flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 shadow-md"></span>
                          </span>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow-sm ring-1 ring-indigo-100 group-hover:bg-indigo-600 transition-colors"></div>
                        )}
                      </div>
                      
                      {/* 节点外层容器卡片 */}
                      <div className={`w-full bg-slate-50/50 hover:bg-indigo-50/20 border rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                        isExpanded ? 'bg-indigo-50/30 border-indigo-100 shadow-sm' : 'border-slate-100 hover:border-indigo-100/60'
                      }`}>
                        {/* 头部摘要信息 */}
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {app.programs?.title || app.program_name}
                          </h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold shrink-0 shadow-sm ${
                            app.daysRemaining === 999 
                              ? 'bg-slate-100 text-slate-500 border border-slate-200'
                              : isUrgent 
                                ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' 
                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          }`}>
                            {app.daysRemaining === 999 ? '未设截止' : `剩 ${app.daysRemaining} 天`}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2.5 text-[10px] text-slate-400 font-bold">
                          <span>截止日期: {app.deadline || '暂未配置'}</span>
                          <span className="text-slate-500">{app.programs?.universities?.name_zh || '全球名校'}</span>
                        </div>

                        {/* 进度条简易渲染（折叠时显示） */}
                        {!isExpanded && totalTasks > 0 && (
                          <div className="mt-3.5 w-full flex items-center gap-2">
                            <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            <span className="text-[9px] font-extrabold text-slate-400 shrink-0">{progressPercentage}%</span>
                          </div>
                        )}

                        {/* ============================================================ */}
                        {/* 展开区域：渲染各申请阶段的 localStorage 子清单管理 */}
                        {/* ============================================================ */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-indigo-100/50 flex flex-col gap-3 animate-scale-in">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-md">
                                当前阶段：{
                                  app.status === 'planning' ? '规划中' :
                                  app.status === 'preparing' ? '材料准备中' :
                                  app.status === 'submitted' ? '已提交申请' :
                                  app.status === 'waiting' ? '等待面试中' :
                                  app.status === 'supplement' ? '补充材料中' : '审核中'
                                }
                              </span>
                              <span className="text-[10px] font-extrabold text-emerald-600">任务进度: {progressPercentage}%</span>
                            </div>

                            {/* 荧光绿发光特效进度条 */}
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-emerald-400 shadow-sm shadow-emerald-300 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                            </div>

                            {/* 子任务勾选 Checkboxes */}
                            {totalTasks === 0 ? (
                              <p className="text-[11px] text-slate-400 font-medium italic py-1">当前阶段无需额外任务，请继续前行！</p>
                            ) : (
                              <div className="flex flex-col gap-2 mt-1">
                                {activeTasks.map(task => {
                                  const isChecked = checkedTasks.includes(task.key);
                                  return (
                                    <div 
                                      key={task.key}
                                      onClick={(e) => handleToggleCheck(app.id, task.key, e)}
                                      className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/80 text-[11px] font-bold text-slate-600 cursor-pointer transition-colors"
                                    >
                                      {/* 将原 label 替换为 div 容器，避免浏览器对 nested input 产生二次事件触发问题 */}
                                      <input 
                                        type="checkbox" 
                                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                                        checked={isChecked}
                                        readOnly // 状态改变由外层 div 的 onClick 托管，使用 readOnly 避免 React 控制台警告
                                      />
                                      <span className={isChecked ? 'line-through text-slate-400 font-medium' : 'text-slate-700'}>
                                        {task.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate('/applications'); }}
                              className="mt-2 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 rounded-xl text-[10px] font-extrabold transition-all text-center"
                            >
                              前往看板管理详情 &rarr;
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ✨ 右栏：最新收藏与快速启动 (7/12 宽度) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex justify-between items-center">
            <span className="flex items-center gap-2"><span>✨</span> 最近收藏</span>
            {favorites.length > 3 && (
              <button 
                onClick={() => navigate('/favorites')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
              >
                查看全部收藏 &rarr;
              </button>
            )}
          </h3>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-4xl mb-4 block">🔍</span>
              <p className="text-slate-500 font-medium">您还没有收藏任何项目</p>
              <p className="text-slate-400 text-xs mt-1">在探索页面找到心仪项目后即可收藏保存进来</p>
              <button 
                onClick={() => navigate('/discover')}
                className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-bold shadow-sm transition-all hover:shadow-md"
              >
                去探索项目
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recentFavorites.map(fav => {
                const program = fav.programs;
                if (!program) return null;
                const isUnderApplication = apps.some(app => app.program_id === program.id);

                return (
                  <div 
                    key={fav.id} 
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-slate-100/50 transition-all duration-300"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{program.title}</h4>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-1">{program.description || '暂无详细介绍'}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {isUnderApplication ? (
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                          已启动申请
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleStartApplication(program.id)}
                          disabled={actionLoadingId === program.id}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-bold shadow-sm hover:shadow transition-all whitespace-nowrap"
                        >
                          {actionLoadingId === program.id ? '启动中...' : '🚀 启动申请'}
                        </button>
                      )}
                      {program.url && (
                        <a 
                          href={program.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-full transition-all"
                        >
                          查看详情 &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
