import React, { useState } from 'react';
import { apiKeysService } from '../services/apiKeysService';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../hooks/useAuth';

/**
 * AI 顾问聊天页面组件 (AiAdvisor Page)
 * 提供与 AI（基于 OpenAI 或 DeepSeek）实时对话的界面。
 * 并能接收 AI 解析出的推荐项目 JSON，渲染成侧边栏供用户“一键导入”到申请看板。
 */
export function AiAdvisorPage() {
  const { user } = useAuth();
  const [input, setInput] = useState(''); // 用户聊天输入框状态
  const [messages, setMessages] = useState([]); // 当前会话的聊天记录上下文
  const [loading, setLoading] = useState(false); // AI 思考/爬虫过程的加载状态
  const [recommended, setRecommended] = useState([]); // 从 AI 回复中提取的推荐项目列表

  const handleSend = async () => {
    if (!input.trim() || !window.electronAPI) return;
    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const keys = apiKeysService.getKeys();
      const result = await window.electronAPI.chatWithAgent(newMsgs, keys);
      setMessages([...newMsgs, { role: 'assistant', content: result.reply }]);
      if (result.programs && result.programs.length > 0) {
        // 去重并追加
        const currentIds = recommended.map(p => p.university_id);
        const newProgs = result.programs.filter(p => !currentIds.includes(p.university_id));
        setRecommended([...recommended, ...newProgs]);
      }
    } catch (err) {
      setMessages([...newMsgs, { role: 'assistant', content: '🚨 ' + err.message }]);
    }
    setLoading(false);
  };

  const handleImport = async (prog) => {
    if (!user) return alert("请先登录系统才能导入看板哦！");
    try {
      await applicationService.insertApplication({
        user_id: user.id,
        program_id: prog.university_id || 'UNKNOWN', // Fallback
        program_name: prog.title, // Keep a copy for UI display
        status: 'planning',
        deadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
      });
      alert(`已成功将【${prog.title}】导入您的申请看板！`);
    } catch(err) {
      console.error(err);
      alert('导入失败：' + err.message);
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex flex-col">
        <h3 className="font-bold text-slate-800 mb-6 text-lg">历史会话</h3>
        <button 
          onClick={() => { setMessages([]); setRecommended([]); }}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
          title="新建咨询会话"
        >
          <span>➕</span>
        </button>
        <div className="mt-8 flex-1 overflow-y-auto">
          {/* Mock history */}
          <div className="p-3 bg-indigo-50/50 rounded-xl text-sm text-indigo-700 font-medium mb-2 border border-indigo-100 cursor-pointer">
            当前会话
          </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-6xl mb-4 opacity-20">🤖</span>
              <p className="text-lg font-medium">我是您的 AI 申请顾问</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-5 rounded-2xl max-w-2xl leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                <pre className="whitespace-pre-wrap font-sans text-[15px]">{m.content}</pre>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="p-5 rounded-2xl bg-white border border-slate-200 text-slate-500 rounded-bl-none flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                 <span className="text-sm font-medium">智能体正在思考并检索全网数据...</span>
               </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="p-4 md:p-8 pt-0 bg-slate-50">
          <div className="flex gap-3 max-w-4xl mx-auto bg-white p-2 rounded-2xl shadow-lg border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="描述您的背景或提问，例如：我的GPA是3.8，适合申请哪些学校？" 
              className="flex-1 p-3 bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400"
              disabled={loading}
            />
            <button 
              onClick={handleSend} 
              disabled={loading || !input.trim()} 
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 font-bold transition-all disabled:hover:bg-indigo-600 shadow-md"
            >
              发送
            </button>
          </div>
        </div>
      </div>

      {/* Plan Board Area */}
      {recommended.length > 0 && (
        <div className="w-80 bg-slate-50 border-l border-slate-200 p-6 flex flex-col gap-5 overflow-y-auto z-10 shadow-xl shadow-slate-200/50">
          <div className="sticky top-0 bg-slate-50 pb-2 z-10 border-b border-slate-200 mb-2">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <span className="text-indigo-600">📋</span> 推荐申请清单
            </h3>
            <p className="text-xs text-slate-500 mt-1">以下是 AI 根据实时检索为您匹配的项目</p>
          </div>
          
          {recommended.map((prog, i) => (
            <div key={i} className="p-5 border border-indigo-100 rounded-2xl bg-white relative group shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 leading-tight">{prog.title}</h4>
              {prog.university_id && <p className="text-xs text-slate-400 mt-1 font-mono">UUID: {prog.university_id.substring(0, 8)}...</p>}
              <button 
                onClick={() => handleImport(prog)} 
                className="mt-4 w-full py-2.5 bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 text-indigo-700 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>✨</span> 一键导入看板
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
