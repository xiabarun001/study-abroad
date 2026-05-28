import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { LoginModal } from '../components/LoginModal';
import { ApiKeysModal } from '../components/ApiKeysModal';

// 引入需要常驻内存 (Keep-Alive) 的三大核心页面组件，以实现 0ms 瞬间无缝切换
import { DiscoverPage } from '../pages/DiscoverPage';
import { ApplicationHubPage } from '../pages/ApplicationHubPage';
import { AiAdvisorPage } from '../pages/AiAdvisorPage';

/**
 * 整个应用的主框架组件 (Layout)
 * 包含全局顶部导航栏 (Header)，并将所有子页面 (Pages) 的具体内容渲染在下面的 <Outlet /> 中。
 * 设定为满屏高度 (h-screen) 并防止外层滚动，确保由各子页面独立处理滚动逻辑。
 */
export function MainLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 获取当前页面路由位置，用于导航栏按钮高亮判断
  const isHomepage = location.pathname === '/'; // 判断当前是否在首页，以便进行自适应导航栏切换
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [loginRedirectPath, setLoginRedirectPath] = useState(''); // 新增：记录登录成功后的重定向页面路径
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 新增：控制顶部右上角用户信息下拉菜单的显隐状态

  // 【新增代码】监听全局登录弹窗自定义事件，方便其它常驻无状态组件（如未登录时的 AI 顾问页）拉起登录窗口进行登录
  useEffect(() => {
    const handleOpenLogin = (e) => {
      if (e.detail) {
        setLoginRedirectPath(e.detail);
      }
      setIsLoginModalOpen(true);
    };
    window.addEventListener('open-login-modal', handleOpenLogin);
    return () => window.removeEventListener('open-login-modal', handleOpenLogin);
  }, []);

  const handleLogout = async () => {
    await authService.signOut();
    navigate('/');
  };

  // 根据当前路由的 pathname 判断所归属的业务范围，用于顶部导航的高亮联动
  const isDiscoverActive = location.pathname === '/discover' || 
    location.pathname.startsWith('/continent/') || 
    location.pathname.startsWith('/country/') || 
    location.pathname.startsWith('/university/');
    
  const isHubActive = location.pathname === '/hub' || 
    location.pathname === '/applications' || 
    location.pathname === '/favorites';
    
  const isAdvisorActive = location.pathname === '/advisor';

  return (
    <div className="text-slate-800 bg-slate-50 h-screen font-sans flex flex-col overflow-hidden">
      <header className={`fixed top-0 left-0 right-0 z-40 px-8 h-16 flex items-center justify-between transition-all duration-300 ${
        isHomepage 
          ? 'bg-transparent shadow-none border-transparent' 
          : 'bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-indigo-600 text-white flex items-center justify-center rounded-lg font-bold text-xl group-hover:bg-indigo-700 transition-colors">H</div>
            <h1 className={`text-xl font-bold tracking-tight transition-colors ${
              isHomepage ? 'text-white' : 'text-slate-800'
            }`}>留学通</h1>
          </div>
          <nav className="hidden lg:flex items-center gap-3.5 text-sm font-semibold">
            {/* 项目大全导航按钮：根据当前路由是否在探索中以及是否在首页动态显示样式 */}
            <button 
              onClick={() => navigate('/discover')}
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all duration-200 flex items-center gap-1.5 border ${
                isDiscoverActive 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100/70 shadow-sm' 
                  : isHomepage
                    ? 'bg-white/10 text-slate-100 border-white/10 hover:bg-white/20 hover:text-white hover:border-white/30 backdrop-blur-sm shadow-none'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:shadow shadow-sm'
              }`}
            >
              <span>🧭</span> 项目大全
            </button>
            
            {/* 申请中心导航按钮：根据当前路由是否在申请中心以及是否在首页动态显示样式 */}
            <button 
              onClick={() => {
                if (user) {
                  navigate('/hub'); // 已登录，跳转到申请中心
                } else {
                  setLoginRedirectPath('/hub'); // 记录登录成功后需要跳转到 /hub
                  setIsLoginModalOpen(true); // 未登录，弹出登录框
                }
              }} 
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all duration-200 flex items-center gap-1.5 border ${
                isHubActive 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100/70 shadow-sm' 
                  : isHomepage
                    ? 'bg-white/10 text-slate-100 border-white/10 hover:bg-white/20 hover:text-white hover:border-white/30 backdrop-blur-sm shadow-none'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:shadow shadow-sm'
              }`}
            >
              <span>📊</span> 申请中心
            </button>

            {/* AI 助手导航按钮：根据当前路由是否在 AI 助手以及是否在首页动态显示样式 */}
            <button 
              onClick={() => {
                // 点击拦截：若未登录则记录重定向至 AI 助手并打开登录弹窗；若已登录则直接进入
                if (user) {
                  navigate('/advisor');
                } else {
                  setLoginRedirectPath('/advisor');
                  setIsLoginModalOpen(true);
                }
              }}
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all duration-200 flex items-center gap-1.5 border ${
                isAdvisorActive 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100/70 shadow-sm' 
                  : isHomepage
                    ? 'bg-white/10 text-slate-100 border-white/10 hover:bg-white/20 hover:text-white hover:border-white/30 backdrop-blur-sm shadow-none'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:shadow shadow-sm'
              }`}
            >
              <span>✨</span> AI 助手
            </button>

            {/* API 密钥配置齿轮按钮：采用与其它导航按钮完美匹配的圆边、阴影与悬停反馈，并在首页使用动态玻璃材质 */}
            <button 
              onClick={() => setIsApiModalOpen(true)} 
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all p-0 border ${
                isHomepage
                  ? 'bg-white/10 text-slate-300 hover:text-white border-white/10 hover:border-white/30 hover:bg-white/20 shadow-none'
                  : 'bg-white text-slate-400 hover:text-indigo-600 border-slate-200 hover:border-indigo-200 hover:shadow shadow-sm'
              }`}
              title="API Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4 relative">
          {user ? (
            <div className="relative">
              {/* 高保真用户卡片按钮：悬停缩放，渐变头像与下拉小箭头 */}
              {/* 头像圆形触发按钮，自带圆润微阴影，根据首页调整边框 */}
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-extrabold text-xs shadow-sm hover:shadow transition-all cursor-pointer overflow-hidden border ${
                  isHomepage ? 'border-indigo-400/50' : 'border-indigo-200'
                }`}
              >
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </button>

              {/* 优雅滑出的下拉菜单卡片，配备毛玻璃边框与精致阴影 */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl p-4.5 z-50 flex flex-col gap-3.5 animate-slide-in-top">
                  <div className="pb-3.5 border-b border-slate-100 flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">当前登录用户</span>
                    <span className="text-sm font-bold text-slate-700 mt-1 truncate" title={user.email}>
                      {user.email}
                    </span>
                  </div>

                  {/* 业务统计快捷导航行 */}
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => { navigate('/applications'); setIsDropdownOpen(false); }}
                      className="w-full py-2 px-3 rounded-xl hover:bg-indigo-50/50 text-slate-600 hover:text-indigo-600 font-bold text-xs flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                    >
                      <span>📂</span> 我的申请看板
                    </button>
                    <button 
                      onClick={() => { navigate('/favorites'); setIsDropdownOpen(false); }}
                      className="w-full py-2 px-3 rounded-xl hover:bg-indigo-50/50 text-slate-600 hover:text-indigo-600 font-bold text-xs flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                    >
                      <span>❤️</span> 我的收藏项目
                    </button>
                  </div>

                  {/* 底部退出登录 */}
                  <div className="pt-2.5 border-t border-slate-100">
                    <button 
                      onClick={async () => {
                        setIsDropdownOpen(false);
                        await authService.signOut();
                      }}
                      className="w-full py-2 px-3 rounded-xl hover:bg-rose-50 text-rose-500 font-bold text-xs flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                    >
                      <span>🚪</span> 退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => { 
                setLoginRedirectPath(''); // 普通登录按钮点击时不进行自动重定向
                setIsLoginModalOpen(true); 
              }} 
              className={`text-sm px-6 py-2 font-medium rounded-full shadow-sm transition-all hover:shadow cursor-pointer ${
                isHomepage
                  ? 'bg-white hover:bg-slate-100 text-slate-900 font-bold'
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
            >
              登录
            </button>
          )}
        </div>
      </header>
      <main className={`flex-1 w-full overflow-hidden flex flex-col relative transition-all duration-300 ${
        isHomepage ? '' : 'pt-16'
      }`}>
        {/* ============================================================ */}
        {/* Keep-Alive 页面常驻渲染区：避免重新加载和向 Supabase 反复发起请求 */}
        {/* ============================================================ */}

        {/* 1. 项目大全 (DiscoverPage)：当路由匹配 /discover 时显示，否则在后台使用 hidden 隐藏 */}
        <div className={`flex-1 w-full flex flex-col min-h-0 ${location.pathname === '/discover' ? '' : 'hidden'}`}>
          <DiscoverPage />
        </div>

        {/* 2. 申请中心 (ApplicationHubPage)：当路由匹配 /hub 时显示，否则在后台使用 hidden 隐藏 */}
        <div className={`flex-1 w-full flex flex-col min-h-0 ${location.pathname === '/hub' ? '' : 'hidden'}`}>
          <ApplicationHubPage />
        </div>

        {/* 3. AI 助手 (AiAdvisorPage)：当路由匹配 /advisor 时显示，否则在后台使用 hidden 隐藏 */}
        <div className={`flex-1 w-full flex flex-col min-h-0 ${location.pathname === '/advisor' ? '' : 'hidden'}`}>
          <AiAdvisorPage />
        </div>

        {/* 4. 其他常规路由（如地图首页、详情页、看板页等），依旧通过 react-router-dom 进行正常的加载渲染 */}
        {!['/discover', '/hub', '/advisor'].includes(location.pathname) && (
          <Outlet />
        )}
      </main>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        redirectPath={loginRedirectPath} // 将重定向目标路径作为 prop 传入登录弹窗
      />

      <ApiKeysModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />
    </div>
  );
}
