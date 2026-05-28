import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAiAdvisor } from '../hooks/useAiAdvisor'; // 引入自定义 Hook 逻辑ViewModel层

// 快捷交互引导提示词列表，用于给用户快速提供提问建议
const QUICK_PROMPTS = [
  {
    icon: '📊',
    label: '背景定位评估',
    text: '我想进行留学背景定位评估。我目前的背景是：双非本科，计算机专业，GPA 3.8/5，雅思 6.5，预算约 25 万人民币/年。请帮我推荐合适的国家和学校。'
  },
  {
    icon: '🌐',
    label: '热门项目推荐',
    text: '请帮我推荐一下当前计算机/软件工程专业最热门的海外硕士项目，并列出它们的申请要求。'
  },
  {
    icon: '📝',
    label: '申请流程与时间线',
    text: '我想申请 2027 年秋季入学，请问应该如何规划我的申请流程和关键时间节点？'
  },
  {
    icon: '💡',
    label: '文书材料写作指导',
    text: '在准备个人陈述 (SoP) 和推荐信 (LoR) 时，有哪些核心要点和常见误区？'
  }
];

/**
 * 奶龙 (Nailong) 风格可爱黄色小恐龙学士帽头像组件 (纯 SVG 实现，完美解决本地图片跨域与权限问题)
 */
function NailongAvatar({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} select-none`}>
      {/* 渐变底圈 */}
      <circle cx="50" cy="50" r="48" fill="#EEF2FF" stroke="#E0E7FF" strokeWidth="1.5" />
      
      {/* 奶龙胖嘟嘟的头部与裙颈部 (Amber 黄色) */}
      <ellipse cx="50" cy="54" rx="28" ry="26" fill="#FBBF24" />
      
      {/* 腮红 (可爱粉色) */}
      <circle cx="30" cy="62" r="4.5" fill="#F87171" opacity="0.7" />
      <circle cx="70" cy="62" r="4.5" fill="#F87171" opacity="0.7" />
      
      {/* 大大的水灵眼睛 (二次元高光效果) */}
      {/* 左眼 */}
      <circle cx="39" cy="50" r="5.5" fill="#1F2937" />
      <circle cx="37" cy="48" r="1.8" fill="#FFFFFF" />
      {/* 右眼 */}
      <circle cx="61" cy="50" r="5.5" fill="#1F2937" />
      <circle cx="59" cy="48" r="1.8" fill="#FFFFFF" />
      
      {/* 可爱的小弯曲嘴巴微笑 */}
      <path d="M 46 61 Q 50 65 54 61" fill="none" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* 头顶的龙脊角 */}
      <path d="M 45 28 L 50 18 L 55 28 Z" fill="#FBBF24" />
      
      {/* 迷你小正装学士帽 */}
      {/* 帽子主体 */}
      <polygon points="34,31 50,23 66,31 50,39" fill="#1E1B4B" />
      {/* 帽子基座 */}
      <path d="M 42 34 L 42 38 Q 50 42 58 38 L 58 34 Z" fill="#312E81" />
      {/* 流苏吊坠 */}
      <path d="M 50 31 L 68 37 L 68 43" fill="none" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="68" cy="44" r="1.2" fill="#FBBF24" />
    </svg>
  );
}

/**
 * 格式化消息发送时间 (格式：HH:mm)
 */
function formatTime(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hrs}:${mins}`;
  } catch (e) {
    return '';
  }
}

/**
 * 强力屏蔽任何泄漏到前台文本的 JSON 信息
 */
function blockJsonFromText(text) {
  if (!text) return '';
  return text.replace(/RECOMMENDED_PROGRAMS:[\s\S]*/i, '').trim();
}

/**
 * 智能留学计划书文本渲染，将 Markdown 语法的标题、列表和加粗等转换为紧凑精美的 React 组件
 */
function formatPlanContent(content) {
  if (!content) return null;
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    
    // 解析 Markdown 标题 H1 到 H3 并赋予清晰字体粗细
    if (trimmed.startsWith('# ')) {
      return <h3 key={idx} className="font-extrabold text-slate-800 text-sm mt-3 mb-1">{line.replace('# ', '')}</h3>;
    }
    if (trimmed.startsWith('## ')) {
      return <h4 key={idx} className="font-bold text-slate-800 text-xs mt-2.5 mb-1">{line.replace('## ', '')}</h4>;
    }
    if (trimmed.startsWith('### ')) {
      return <h5 key={idx} className="font-bold text-slate-700 text-[11px] mt-2 mb-0.5">{line.replace('### ', '')}</h5>;
    }
    
    // 解析无序列表
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      return (
        <ul key={idx} className="list-disc pl-4 my-1">
          <li className="text-[11px] text-slate-600 select-text">{parseBoldTextPlan(line.replace(/^[\s\-\*•]+/, ''))}</li>
        </ul>
      );
    }
    
    // 解析有序列表
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <ol key={idx} className="list-decimal pl-4 my-1">
          <li className="text-[11px] text-slate-600 select-text">{parseBoldTextPlan(line.replace(/^\d+\.\s+/, ''))}</li>
        </ol>
      );
    }
    
    // 处理空行
    if (trimmed === '') {
      return <div key={idx} className="h-1.5" />;
    }
    
    // 普通正文段落
    return <p key={idx} className="text-[11px] text-slate-600 leading-relaxed my-0.5 select-text">{parseBoldTextPlan(line)}</p>;
  });
}

/**
 * 计划书加粗字符解析高亮
 */
function parseBoldTextPlan(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-slate-800 font-extrabold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * 轻量级 Markdown 语法解析渲染，支持加粗、列表、换行以及代码块格式
 */
function formatMessageContent(content, role) {
  if (!content) return null;
  
  // 使用正则表达式对代码块进行切分
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    // 渲染代码块
    if (part.startsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const code = match ? match[2] : part.slice(3, -3);
      return (
        <pre key={index} className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs my-2.5 overflow-x-auto select-text">
          <code>{code}</code>
        </pre>
      );
    }
    
    // 渲染常规文本段落、加粗 and 列表
    const lines = part.split('\n');
    return (
      <div key={index} className="space-y-1.5">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          
          // 解析无序列表
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            const cleanText = line.replace(/^[\s\-\*•]+/, '');
            return (
              <ul key={lineIdx} className="list-disc pl-5 my-0.5">
                <li className="text-[15px] select-text">{parseBoldText(cleanText, role)}</li>
              </ul>
            );
          }
          
          // 解析有序列表
          if (/^\d+\.\s/.test(trimmed)) {
            const cleanText = line.replace(/^\d+\.\s+/, '');
            const num = trimmed.match(/^(\d+)\./)[1];
            return (
              <ol key={lineIdx} className="list-decimal pl-5 my-0.5" start={num}>
                <li className="text-[15px] select-text">{parseBoldText(cleanText, role)}</li>
              </ol>
            );
          }
          
          // 处理空行
          if (trimmed === '') {
            return <div key={lineIdx} className="h-2" />;
          }
          
          // 普通文本行
          return <p key={lineIdx} className="text-[15px] select-text leading-relaxed">{parseBoldText(line, role)}</p>;
        })}
      </div>
    );
  });
}

/**
 * 解析并高亮 **加粗** 的文字内容
 */
function parseBoldText(text, role) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong 
          key={idx} 
          className={`font-bold ${role === 'user' ? 'text-white' : 'text-slate-900 font-extrabold'}`}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function AiAdvisorPage() {
  const { user } = useAuth();
  
  // 调用自定义 Hook 统一加载所有留学顾问的核心业务状态与业务动作，解除页面组件的重度逻辑负担
  const {
    input,
    setInput,
    messages,
    loading,
    agentStatus,
    recommended,
    isSearchEnabled,
    setIsSearchEnabled,
    isPlanPanelOpen,
    setIsPlanPanelOpen,
    studyPlan,
    planLoading,
    sessions,
    currentSessionId,
    sessionToDelete,
    setSessionToDelete,
    toast,
    handleSelectSession,
    handleNewSession,
    handleDeleteClick,
    performDeleteSession,
    handleSendWithText,
    handleGeneratePlan,
    handleDownloadPlan,
    handleImport
  } = useAiAdvisor(user);

  // 【新增代码】未登录状态下的兜底锁屏卡片，指导用户进行登录以开启 AI 留学顾问服务
  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-[500px]">
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-100 rounded-3xl p-8 shadow-xl max-w-sm text-center flex flex-col items-center gap-5.5 select-none">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl shadow-inner">
            ✨
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-base">开启 AI 留学规划顾问</h3>
            <p className="text-xs text-slate-500 leading-relaxed px-2">
              AI 智能顾问会根据您的沟通历史，为您定制个性化的留学申请背景评估和专属计划书。请先登录开启您的尊享体验！
            </p>
          </div>
          <button 
            onClick={() => {
              // 触发全局登录事件，打开顶栏的登录框并指定在登录成功后重定向返回至 /advisor
              window.dispatchEvent(new CustomEvent('open-login-modal', { detail: '/advisor' }));
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
          >
            立即登录
          </button>
        </div>
      </div>
    );
  }

  // 正常发送按钮点击动作分发
  const handleSend = () => {
    handleSendWithText(input);
  };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden">
      {/* Sidebar - 真实加载的会话历史栏 */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex flex-col">
        <h3 className="font-bold text-slate-800 mb-6 text-lg">历史会话</h3>
        <button 
          onClick={handleNewSession}
          // 改为左对齐 (justify-start px-4)，使之与下方会话列表图标对齐，采用统一的 rounded-xl 圆角
          className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl transition-all text-sm flex items-center justify-start gap-2.5 border border-indigo-100 hover:shadow-sm cursor-pointer"
          title="新建咨询会话"
        >
          <span>＋ 新建会话</span>
        </button>
        
        {/* 动态渲染历史会话列表，统一采用 rounded-xl 布局并垂直居中对齐图标 */}
        <div className="mt-5 flex-1 overflow-y-auto space-y-2 silent-scroll">
          {sessions.map(s => (
            <div 
              key={s.id}
              onClick={() => handleSelectSession(s.id, s.recommended_programs || [])}
              className={`py-3 px-4 rounded-xl text-sm transition-all border cursor-pointer relative group flex justify-between items-center ${
                currentSessionId === s.id 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold shadow-sm' 
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
              }`}
            >
              {/* 使用 flex items-center gap-2.5 使得会话图标和标题文字在垂直方向完美居中对齐 */}
              <div className="truncate pr-2 flex-1 flex items-center gap-2.5">
                <span className="text-base shrink-0">💬</span>
                <span className="truncate">{s.title}</span>
              </div>
              <button 
                onClick={(e) => handleDeleteClick(e, s.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200/50 transition-all font-bold shrink-0"
                title="删除会话"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat Area - 聊天对话区域 */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Agent Header - 顶部智能体在线指示栏 */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              {/* 使用可爱的动漫奶龙学士帽头像组件 */}
              <NailongAvatar className="w-10 h-10" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
            </div>
            <div>
              {/* 仅保留核心主标题，精简去掉了小字副标题描述 */}
              <h4 className="font-bold text-slate-800 text-sm">AI 留学顾问</h4>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-600 font-bold rounded-full border border-emerald-100">
              ● 在线
            </span>
            {/* 新增：右侧计划面板展开切换按钮 */}
            <button
              onClick={() => setIsPlanPanelOpen(!isPlanPanelOpen)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm ${
                isPlanPanelOpen 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100/50' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
              title={isPlanPanelOpen ? '隐藏右侧留学规划与推荐面板' : '查看右侧留学规划与推荐面板'}
            >
              <span>📋</span> {isPlanPanelOpen ? '隐藏规划面板' : '查看规划面板'}
            </button>
          </div>
        </div>

        {/* 消息滚动区 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {/* 空对话状态：渲染引导式提问快捷按钮卡片 */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-4 text-center">
              <div className="w-20 h-20 mb-6 flex items-center justify-center animate-bounce-subtle">
                {/* 欢迎栏中也同步替换为可爱的动漫奶龙学士帽头像组件 */}
                <NailongAvatar className="w-20 h-20" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI 智能留学顾问</h2>
              <p className="text-slate-500 mt-2 max-w-md text-sm leading-relaxed">
                我是您的专属 AI 留学导师。我拥有丰富的院校数据库，支持联网检索最新招生政策，并能为您提供个性化的择校和背景定位建议。
              </p>
              <div className="mt-2 text-indigo-600 text-xs font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5 select-none animate-pulse">
                <span>💡 提示：点击右上角【📋 查看规划面板】可一键生成专属留学计划书并管理推荐项目</span>
              </div>
              
              <div className="w-full mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUICK_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendWithText(prompt.text)}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl text-left hover:border-indigo-400 hover:shadow-md transition-all group flex items-start gap-3.5 cursor-pointer shadow-sm"
                  >
                    <span className="text-2xl p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">{prompt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors text-sm">{prompt.label}</h4>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">{prompt.text}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 渲染对话气泡，附带发送时间戳 */}
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-5 rounded-2xl max-w-2xl leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
              }`}>
                {formatMessageContent(m.content, m.role)}
              </div>
              <span className={`text-[10px] text-slate-400 mt-1.5 block px-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.created_at ? formatTime(m.created_at) : ''}
              </span>
            </div>
          ))}

          {/* 分步状态加载指示器与实时进度条 */}
          {loading && (
            <div className="flex justify-start animate-fade-in">
               <div className="p-5 rounded-2xl bg-white border border-slate-200 text-slate-500 rounded-bl-none flex flex-col gap-2.5 shadow-sm">
                 <div className="flex items-center gap-3">
                   <div className="w-4 h-4 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                   <span className="text-sm font-semibold text-slate-700">
                     {agentStatus === 'thinking' && '🔍 智能体正在分析您的背景与问题...'}
                     {agentStatus === 'searching' && '🌐 正在为您进行全网实时检索验证...'}
                     {agentStatus === 'scraping' && '📊 正在分析、筛选与整理检索数据...'}
                     {agentStatus === 'responding' && '💡 正在生成最终留学择校建议...'}
                     {!agentStatus && '🤖 智能体正在思考中...'}
                   </span>
                 </div>
                 
                 {/* 横向进度条 */}
                 <div className="w-56 h-1 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-indigo-600 transition-all duration-700 ease-out rounded-full"
                     style={{
                       width: 
                         agentStatus === 'thinking' ? '25%' :
                         agentStatus === 'searching' ? '50%' :
                         agentStatus === 'scraping' ? '75%' :
                         agentStatus === 'responding' ? '92%' : '10%'
                     }}
                   />
                 </div>
               </div>
            </div>
          )}
        </div>
        
        {/* 横向快捷问题建议标签，在有对话历史时显示在输入框上方 */}
        {messages.length > 0 && (
          <div className="max-w-4xl mx-auto w-full px-4 md:px-8 mb-3 flex gap-2 overflow-x-auto pb-1.5 silent-scroll select-none shrink-0">
            {QUICK_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSendWithText(prompt.text)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 rounded-full text-xs font-semibold text-slate-600 shadow-sm transition-all whitespace-nowrap cursor-pointer hover:shadow disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>{prompt.icon}</span>
                <span>{prompt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Area - 输入区域 */}
        <div className="p-4 md:p-8 pt-0 bg-slate-50 shrink-0">
          <div className="flex gap-3 max-w-4xl mx-auto bg-white p-2.5 rounded-2xl shadow-lg border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all items-center">
            {/* 联网检索模式切换 Toggle 开关：高保真状态颜色变换 */}
            <button
              onClick={() => setIsSearchEnabled(!isSearchEnabled)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 select-none cursor-pointer ${
                isSearchEnabled 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100/70 shadow-sm' 
                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/70'
              }`}
              title={isSearchEnabled ? '已开启实时联网搜索招生信息政策' : '已关闭联网搜索，仅使用本地大模型知识作答'}
            >
              <span>🌐</span>
              <span className="hidden sm:inline">{isSearchEnabled ? '联网开启' : '离线模式'}</span>
            </button>

            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // 阻止回车产生默认提交/双发行为
                  handleSend();
                }
              }}
              className="flex-1 p-2 bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400 text-[15px]"
              disabled={loading}
            />
            <button 
              onClick={handleSend} 
              disabled={loading || !input.trim()} 
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 font-bold transition-all disabled:hover:bg-indigo-600 shadow-md cursor-pointer shrink-0"
            >
              发送
            </button>
          </div>
        </div>
      </div>

      {/* 右侧智能留学规划与推荐项目面板 */}
      {isPlanPanelOpen && (
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full animate-slide-in-right shrink-0">
          {/* 面板头部 */}
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base select-none">
              <span>📋</span> 留学规划与推荐
            </h3>
            <button 
              onClick={() => setIsPlanPanelOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 silent-scroll">
            {/* 栏目一：智能留学计划书 */}
            <div className="bg-gradient-to-br from-indigo-50/60 to-sky-50/40 border border-indigo-100/50 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
              <div className="flex justify-between items-center select-none">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <span>✨</span> 智能留学计划书
                </h4>
                {studyPlan && (
                  <button
                    onClick={handleDownloadPlan}
                    className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded-lg transition-all shadow-sm"
                  >
                    下载 (.md)
                  </button>
                )}
              </div>

              {planLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2.5">
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                  <span className="text-xs text-slate-500 font-medium">正在基于对话分析生成专属计划...</span>
                </div>
              ) : studyPlan ? (
                <div className="max-h-64 overflow-y-auto bg-white/80 border border-indigo-100/30 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed space-y-2 select-text silent-scroll">
                  {formatPlanContent(studyPlan)}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 font-medium select-none">
                  点击下方按钮，AI 顾问将根据当前的会话内容为您定制一份专属的留学规划！
                </div>
              )}

              {!planLoading && (
                <button
                  onClick={handleGeneratePlan}
                  className="w-full py-2.5 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 hover:border-indigo-300 font-bold rounded-xl text-xs transition-all cursor-pointer text-center select-none"
                >
                  {studyPlan ? '🔄 重新生成计划书' : '📝 一键生成计划书'}
                </button>
              )}
            </div>

            {/* 栏目二：当前会话推荐的学校项目 */}
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5 select-none">
                <span>🏫</span> 推荐申请项目 ({recommended.length})
              </h4>
              {recommended.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium select-none">
                  暂无推荐项目。您可以在对话中让 AI 为您推荐院校项目。
                </div>
              ) : (
                <div className="space-y-3">
                  {recommended.map((prog, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col gap-2 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all shadow-sm">
                      <div className="flex justify-between items-start gap-2">
                        <h5 className="font-bold text-slate-700 text-xs leading-snug line-clamp-1">{prog.title}</h5>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                        <span>大学: {prog.university_id || '待指定'}</span>
                      </div>
                      <button
                        onClick={() => handleImport(prog)}
                        className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg text-[10px] font-bold border border-indigo-100 hover:border-indigo-600 transition-all cursor-pointer text-center"
                      >
                        🚀 导入到申请看板
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      {/* 美观的高级自定义确认删除模态框 */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in select-none">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 transform scale-100 transition-all duration-300 animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">确认删除会话</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                您确定要删除这次的咨询会话吗？删除后，该会话下的所有历史消息和推荐都将永久丢失且无法恢复。
              </p>
              
              <div className="flex gap-3 w-full mt-6">
                <button
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={async () => {
                    const id = sessionToDelete;
                    setSessionToDelete(null);
                    await performDeleteSession(id);
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-rose-200/50 cursor-pointer"
                >
                  确定删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 优雅的高级自定义 Toast 提示框 */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/80 animate-slide-in-right select-none">
          <span className="text-lg">
            {toast.type === 'success' && '✨'}
            {toast.type === 'error' && '🚨'}
            {toast.type === 'warning' && '⚠️'}
          </span>
          <span className="text-sm font-semibold text-slate-700">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
