import { useState, useEffect, useRef } from 'react';
import { apiKeysService } from '../services/apiKeysService';
import { applicationService } from '../services/applicationService';
import { chatService } from '../services/chatService';
import { supabase, supabaseAnon } from '../shared/db/supabase';

/**
 * AI 智能留学顾问自定义 Hook (useAiAdvisor)
 * 封装与 Electron 主进程 IPC 交互、云端 Supabase 对话持久化、LocalStorage 缓存读取
 * 以及计划书流式生成、导出和一键导入看板等复杂业务逻辑。
 * @param {Object} user - 当前登录的 Supabase 用户对象
 */
export function useAiAdvisor(user) {
  // --- 状态定义 ---
  const [input, setInput] = useState(''); // 聊天框输入文本状态
  const [messages, setMessages] = useState([]); // 当前选中会话的消息历史
  const [loading, setLoading] = useState(false); // 对话框加载指示
  const [agentStatus, setAgentStatus] = useState(''); // 智能体当前的执行步骤状态 ('thinking' | 'searching' | 'scraping' | 'responding')
  const [recommended, setRecommended] = useState([]); // 当前会话已被 AI 推荐的项目列表
  const [isSearchEnabled, setIsSearchEnabled] = useState(true); // 联网搜索状态 Toggle
  
  const [isPlanPanelOpen, setIsPlanPanelOpen] = useState(false); // 右侧滑出面板的展示控制
  const [studyPlan, setStudyPlan] = useState(''); // 当前会话的 Markdown 留学计划书正文
  const [planLoading, setPlanLoading] = useState(false); // 生成计划书时的 loading 加载标记
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false); // 标记当前推流是否属于留学计划书

  const [sessionMessagesCache, setSessionMessagesCache] = useState({}); // 会话消息本地缓存，防止页面来回切换造成的网络白屏
  const [sessions, setSessions] = useState([]); // 历史会话列表
  const [currentSessionId, setCurrentSessionId] = useState(null); // 当前选中的会话 ID
  const [sessionToDelete, setSessionToDelete] = useState(null); // 确认删除会话时缓存的 ID 状态
  const [toast, setToast] = useState(null); // 全局轻提示 Toast

  // --- Ref 变量缓存以处理 SSE 流闭包问题 ---
  const isGeneratingPlanRef = useRef(false);
  useEffect(() => {
    isGeneratingPlanRef.current = isGeneratingPlan;
  }, [isGeneratingPlan]);

  // --- 全局通用 Toast 提示控制 ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 3000);
  };

  // --- 订阅绑定与卸载 Electron 推送事件 ---
  useEffect(() => {
    if (!window.electronAPI) return;

    // A. 订阅智能体执行状态通知
    const unsubscribeStatus = window.electronAPI.onAgentStatus((status) => {
      setAgentStatus(status);
    });

    // B. 订阅大模型生成的文本片段数据流 (SSE Chunk)
    const unsubscribeChunk = window.electronAPI.onAgentChunk((chunk) => {
      if (isGeneratingPlanRef.current) {
        // 如果当前是留学计划书生成模式，则将文本片段追加到计划书文本中
        setStudyPlan(prev => (prev || '') + chunk);
      } else {
        // 正常对话模式，拼接追加到最后一条 AI 助手的气泡内容上
        setMessages(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content += chunk;
          }
          return updated;
        });
      }
    });

    return () => {
      // 卸载钩子时退订事件，彻底避免 React 重复订阅导致的内存泄漏问题
      unsubscribeStatus();
      unsubscribeChunk();
    };
  }, []);

  // --- 初始化：自动拉取会话列表，若为空则自动新建 ---
  useEffect(() => {
    const initSessions = async () => {
      if (!user) return;
      try {
        const data = await chatService.getSessions(user.id);
        if (data && data.length > 0) {
          setSessions(data);
          // 默认选中最新修改的第一个会话，并加载其计划书与对话内容
          await handleSelectSession(data[0].id, data[0].recommended_programs || []);
        } else {
          // 静默自动创建第一个新会话
          await handleNewSession();
        }
      } catch (err) {
        console.error("加载历史会话列表异常:", err);
      }
    };
    initSessions();
  }, [user]);

  // --- 切换会话并加载其关联信息 ---
  const handleSelectSession = async (sessionId, recommendedProgs = []) => {
    setCurrentSessionId(sessionId);
    setRecommended(recommendedProgs || []);
    setAgentStatus(''); // 重置执行步骤
    
    // 从 localStorage 读取该会话已生成的计划书缓存文本
    const savedPlan = localStorage.getItem(`study_plan_${sessionId}`);
    setStudyPlan(savedPlan || '');
    
    // 如果缓存字典中已经有该会话记录，执行 0ms 瞬间本地渲染
    if (sessionMessagesCache[sessionId]) {
      setMessages(sessionMessagesCache[sessionId]);
      setLoading(false);
    } else {
      setMessages([]);
      setLoading(true);
    }

    try {
      // 后台静默抓取服务器最新消息记录并同步覆盖
      const messagesData = await chatService.getMessages(sessionId);
      if (messagesData) {
        const formattedMsgs = messagesData.map(msg => ({ 
          role: msg.role, 
          content: msg.content,
          created_at: msg.created_at
        }));
        setMessages(formattedMsgs);
        setSessionMessagesCache(prev => ({
          ...prev,
          [sessionId]: formattedMsgs
        }));
      }
    } catch (err) {
      console.error("加载会话消息失败:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 新建会话 (Optimistic UI 瞬间切换) ---
  const handleNewSession = async () => {
    if (!user) return;
    
    const tempId = 'temp-' + Date.now();
    const tempSession = {
      id: tempId,
      title: '新会话',
      recommended_programs: [],
      created_at: new Date().toISOString()
    };
    
    setSessions(prev => [tempSession, ...prev]);
    setCurrentSessionId(tempId);
    setMessages([]);
    setRecommended([]);
    setStudyPlan(''); // 重置计划书文本
    setAgentStatus('');

    try {
      // 在后台静默向 Supabase 插入新记录并更新临时 ID
      const newSession = await chatService.createSession(user.id);
      if (newSession) {
        // 【新增逻辑】迁移计划书本地缓存：若存在以临时 ID 命名的计划书，将其复制迁移到新创建的真实 UUID 对应键下，防止计划书丢失
        const tempPlan = localStorage.getItem(`study_plan_${tempId}`);
        if (tempPlan) {
          localStorage.setItem(`study_plan_${newSession.id}`, tempPlan);
          localStorage.removeItem(`study_plan_${tempId}`);
        }

        setSessions(prev => prev.map(s => s.id === tempId ? newSession : s));
        setCurrentSessionId(prevId => prevId === tempId ? newSession.id : prevId);
        setSessionMessagesCache(prev => {
          const updated = { ...prev };
          if (updated[tempId]) {
            updated[newSession.id] = updated[tempId];
            delete updated[tempId];
          }
          return updated;
        });
      }
    } catch (err) {
      console.error("新建会话失败:", err);
      // 回退 UI 列表
      setSessions(prev => prev.filter(s => s.id !== tempId));
      if (currentSessionId === tempId) setCurrentSessionId(null);
    }
  };

  // --- 删除会话事件处理 ---
  const handleDeleteClick = (e, sessionId) => {
    e.stopPropagation(); // 阻止 click 事件冒泡防止触发切换会话
    setSessionToDelete(sessionId);
  };

  const performDeleteSession = async (sessionId) => {
    // 移除对应的内存缓存
    setSessionMessagesCache(prev => {
      const updated = { ...prev };
      delete updated[sessionId];
      return updated;
    });

    try {
      await chatService.deleteSession(sessionId);
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      
      // 如果删除的是当前选中的会话，自动切换
      if (currentSessionId === sessionId) {
        if (updatedSessions.length > 0) {
          await handleSelectSession(updatedSessions[0].id, updatedSessions[0].recommended_programs || []);
        } else {
          await handleNewSession();
        }
      }
      showToast("已成功删除该咨询会话！", "success");
    } catch (err) {
      console.error("删除会话失败:", err);
      showToast("删除会话失败：" + err.message, "error");
    }
  };

  // --- 发送消息处理逻辑 (乐观渲染气泡并异步写入 Supabase) ---
  const handleSendWithText = async (textToSend) => {
    if (loading || !textToSend.trim() || !window.electronAPI || !currentSessionId) return;
    
    if (currentSessionId.startsWith('temp-')) {
      showToast("会话正在为您准备中，请稍后发送...", "warning");
      return;
    }
    
    const userMessageContent = textToSend;
    const timestamp = new Date().toISOString();
    
    const newMsgs = [...messages, { role: 'user', content: userMessageContent, created_at: timestamp }];
    // 在界面中乐观插入一个内容为空的助理气泡作为流式接收的占位容器
    const newMsgsWithPlaceholder = [...newMsgs, { role: 'assistant', content: '', created_at: timestamp }];
    
    setMessages(newMsgsWithPlaceholder);
    setSessionMessagesCache(prev => ({
      ...prev,
      [currentSessionId]: newMsgsWithPlaceholder
    }));
    setInput('');
    setLoading(true);
    setAgentStatus('thinking');

    try {
      // A. 异步在后台静默保存用户消息记录
      const saveUserMsgPromise = chatService.saveMessage(currentSessionId, 'user', userMessageContent)
        .catch(err => console.error("保存用户消息异常:", err));

      // B. 新会话根据首句进行智能自动重命名
      const currentSession = sessions.find(s => s.id === currentSessionId);
      let updateTitlePromise = Promise.resolve();
      if (currentSession && currentSession.title === '新会话') {
        const autoTitle = userMessageContent.length > 15 
          ? userMessageContent.substring(0, 15) + '...' 
          : userMessageContent;
        updateTitlePromise = chatService.updateSessionTitle(currentSessionId, autoTitle)
          .then(() => {
            setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title: autoTitle } : s));
          })
          .catch(err => console.error("更新会话标题异常:", err));
      }

      // C. 调用主进程大模型进行流式问答
      const keys = apiKeysService.getKeys();
      const result = await window.electronAPI.chatWithAgent(newMsgs, keys, { isSearchEnabled });

      // 合备后台保存进程
      await Promise.all([saveUserMsgPromise, updateTitlePromise]);

      // D. 静默将 AI 的完整回复保存入消息表
      const saveAssistantMsgPromise = chatService.saveMessage(currentSessionId, 'assistant', result.reply)
        .catch(err => console.error("保存 AI 消息异常:", err));

      // E. 对推荐项目字段进行去重合并
      let updatedRecommended = [...recommended];
      let updateRecsPromise = Promise.resolve();
      if (result.programs && result.programs.length > 0) {
        const currentIds = recommended.map(p => p.university_id);
        const newProgs = result.programs.filter(p => !currentIds.includes(p.university_id));
        updatedRecommended = [...recommended, ...newProgs];
        
        updateRecsPromise = chatService.updateSessionRecommendations(currentSessionId, updatedRecommended)
          .then(() => {
            setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, recommended_programs: updatedRecommended } : s));
          })
          .catch(err => console.error("保存推荐项目清单异常:", err));
      }

      // 剥离 RECOMMENDED_PROGRAMS JSON 隐藏，最终安全渲染
      const cleanedReply = result.reply.replace(/RECOMMENDED_PROGRAMS:[\s\S]*/i, '').trim();
      const finalMsgs = [...newMsgs, { role: 'assistant', content: cleanedReply, created_at: new Date().toISOString() }];
      
      setRecommended(updatedRecommended);
      setMessages(finalMsgs);
      setSessionMessagesCache(prev => ({
        ...prev,
        [currentSessionId]: finalMsgs
      }));

      await Promise.all([saveAssistantMsgPromise, updateRecsPromise]);

    } catch (err) {
      const errorMsgs = [...newMsgs, { role: 'assistant', content: '🚨 ' + err.message, created_at: new Date().toISOString() }];
      setMessages(errorMsgs);
      setSessionMessagesCache(prev => ({
        ...prev,
        [currentSessionId]: errorMsgs
      }));
    } finally {
      setLoading(false);
      setAgentStatus('');
    }
  };

  // --- 智能留学计划书生成逻辑 ---
  const handleGeneratePlan = async () => {
    if (loading || !currentSessionId) return;
    
    // 【新增逻辑】安全拦截：如果当前会话为以 temp- 开头的临时会话，说明后台尚未创建完毕，需提示用户稍等
    if (currentSessionId.startsWith('temp-')) {
      showToast("会话正在为您准备中，请稍后生成计划书...", "warning");
      return;
    }
    
    setPlanLoading(true);
    setIsGeneratingPlan(true);
    setStudyPlan(''); // 清空旧数据

    try {
      const keys = apiKeysService.getKeys();
      
      const planPromptMsg = {
        role: 'user',
        content: `【生成留学计划书指令】：请根据我们上述的沟通对话内容，整理出一部详尽且排版优美的“留学计划书”，采用 Markdown 格式输出。
内容必须包含：
1. 💡 留学背景评估 (GPA, 语言, 专业背景等定位评价)
2. 🏫 推荐申请的国家及目标院校项目清单 (附带推荐理由与大概要求)
3. 📅 核心备考与申请材料筹备时间线 (按月份或阶段列出如 TOEFL/IELTS 备考, SoP 撰写, 推荐信获取, 递交网申等)
4. 🚀 顾问核心建议与下一步行动指南 (如背景提升、软实力提升建议等)

请直接输出计划书正文，字数在 800 字左右，不要包含任何系统性解释或废话。`
      };
      
      const planMessages = [...messages, planPromptMsg];
      
      // 执行流式调用大模型
      const result = await window.electronAPI.chatWithAgent(planMessages, keys, { isSearchEnabled: false });
      
      // 持久化存储
      localStorage.setItem(`study_plan_${currentSessionId}`, result.reply);
      showToast("留学计划书生成成功！", "success");
    } catch (err) {
      console.error("生成留学计划书异常:", err);
      showToast("生成计划书失败：" + err.message, "error");
    } finally {
      setPlanLoading(false);
      setIsGeneratingPlan(false);
    }
  };

  // --- 留学计划书本地下载逻辑 ---
  const handleDownloadPlan = () => {
    if (!studyPlan) return;
    try {
      const blob = new Blob([studyPlan], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `留学计划书_${Date.now()}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("计划书下载成功！", "success");
    } catch (err) {
      console.error("导出下载留学计划书异常:", err);
      showToast("下载文件失败：" + err.message, "error");
    }
  };

  // --- 一键导入至申请看板 (物理外键兼容处理) ---
  const handleImport = async (prog) => {
    if (!user) return showToast("请先登录系统才能导入看板哦！", "warning");
    try {
      let finalProgramId = null;
      
      // 【新增逻辑】检测是否为 UUID 格式
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prog.university_id);
      
      // 【新增逻辑】解析大学友好名称，如果是 UUID 则从数据库查询获取，否则直接使用该文本值
      let universityName = '未指定大学';
      if (isUuid) {
        const { data: univData } = await supabase
          .from('universities')
          .select('name_zh')
          .eq('id', prog.university_id)
          .limit(1)
          .maybeSingle();
        if (univData && univData.name_zh) {
          universityName = univData.name_zh;
        }
      } else if (prog.university_id) {
        universityName = prog.university_id;
      }

      // 【重构逻辑】查询 programs 中是否已存在相同名称与大学的留学项目，避免重复建档（使用物理上确实存在的 university 文本字段）
      const { data: existingProg } = await supabase
        .from('programs')
        .select('id')
        .eq('title', prog.title)
        .eq('university', universityName)
        .limit(1)
        .maybeSingle();

      if (existingProg) {
        finalProgramId = existingProg.id;
      }

      // programs 表无同名则写入 programs 建档
      if (!finalProgramId) {
        // 【重构逻辑】严格根据 programs 表的物理 schema 插入字段（仅包含 title、description、url、university），移去不存在的 degree 等列，防止架构缓存未匹配报错
        const { data: newProg, error: createProgErr } = await supabaseAnon
          .from('programs')
          .insert([{
            title: prog.title,
            description: prog.description || `AI 助手智能择校对话推荐的留学项目`,
            url: prog.url || '#',
            university: universityName
          }])
          .select('id')
          .single();
          
        if (createProgErr) throw createProgErr;
        finalProgramId = newProg.id;
      }
      
      // 写入 user_applications 看板中
      await applicationService.insertApplication({
        user_id: user.id,
        program_id: finalProgramId,
        status: 'planning',
        deadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
      });
      
      showToast(`已成功将【${prog.title}】导入您的申请看板！`, "success");
    } catch(err) {
      console.error("导入申请大盘看板失败:", err);
      showToast('导入失败：' + err.message, "error");
    }
  };

  return {
    input,
    setInput,
    messages,
    setMessages,
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
  };
}
